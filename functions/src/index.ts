import { onCall, HttpsError } from 'firebase-functions/v2/https';
// import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Define secrets
const resendApiKey = defineSecret('RESEND_API_KEY');
// Twilio secrets will be added when SMS is configured
// const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
// const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
// const twilioPhoneNumber = defineSecret('TWILIO_PHONE_NUMBER');

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store verification code in Firestore
async function storeVerificationCode(
  identifier: string,
  code: string,
  type: 'email' | 'phone'
): Promise<void> {
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
  );

  await db.collection('verificationCodes').doc(`${type}_${identifier}`).set({
    code,
    type,
    identifier,
    expiresAt,
    verified: false,
    attempts: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Verify code from Firestore
async function verifyCodeFromStore(
  identifier: string,
  code: string,
  type: 'email' | 'phone'
): Promise<{ success: boolean; message: string }> {
  const docRef = db.collection('verificationCodes').doc(`${type}_${identifier}`);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { success: false, message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.' };
  }

  const data = doc.data()!;

  // Check if already verified
  if (data.verified) {
    return { success: false, message: 'Bu kod zaten kullanılmış.' };
  }

  // Check expiry
  if (data.expiresAt.toDate() < new Date()) {
    await docRef.delete();
    return { success: false, message: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.' };
  }

  // Check attempts (max 5)
  if (data.attempts >= 5) {
    await docRef.delete();
    return { success: false, message: 'Çok fazla hatalı deneme. Lütfen yeni kod isteyin.' };
  }

  // Increment attempts
  await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });

  // Check code
  if (data.code !== code) {
    return { success: false, message: 'Doğrulama kodu hatalı.' };
  }

  // Mark as verified
  await docRef.update({ verified: true });

  return { success: true, message: 'Doğrulama başarılı!' };
}

// ==================== EMAIL FUNCTIONS ====================

export const sendEmailVerification = onCall(
  { secrets: [resendApiKey], region: 'europe-west1' },
  async (request) => {
    const { email } = request.data;

    if (!email) {
      throw new HttpsError('invalid-argument', 'Email adresi gerekli.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'Geçersiz email formatı.');
    }

    // Rate limiting: Check if a code was sent recently
    const existingDoc = await db.collection('verificationCodes').doc(`email_${email}`).get();
    if (existingDoc.exists) {
      const docData = existingDoc.data()!;
      const createdAt = docData.createdAt?.toDate();
      if (createdAt && Date.now() - createdAt.getTime() < 60000) {
        throw new HttpsError(
          'resource-exhausted',
          'Lütfen yeni kod istemeden önce 1 dakika bekleyin.'
        );
      }
    }

    const code = generateVerificationCode();

    // Store code
    await storeVerificationCode(email, code, 'email');

    // Log code for debugging (can be viewed in Firebase Console -> Functions -> Logs)
    console.log(`📧 Email verification code for ${email}: ${code}`);

    // Send email via Resend
    const apiKey = resendApiKey.value();
    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        const result = await resend.emails.send({
          from: 'turing <noreply@turingtr.com>',
          to: email,
          subject: 'turing - Email Doğrulama Kodu',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4b30b8; margin: 0;">turing</h1>
              </div>
              <div style="background: linear-gradient(135deg, #4b30b8 0%, #a855f7 100%); border-radius: 16px; padding: 30px; text-align: center; color: white;">
                <h2 style="margin: 0 0 10px 0;">Email Doğrulama</h2>
                <p style="margin: 0 0 20px 0; opacity: 0.9;">Doğrulama kodunuz:</p>
                <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
                </div>
                <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.8;">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
              </div>
              <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
                Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
              </p>
            </div>
          `,
        });
        console.log('📧 Resend result:', JSON.stringify(result));
      } catch (error: any) {
        console.error('❌ Resend Error:', error);
        // Don't throw - code is saved in Firestore, user can check logs
        console.log(`⚠️ Email failed but code is: ${code}`);
      }
    } else {
      console.log(`⚠️ No Resend API key - code is: ${code}`);
    }

    return {
      success: true,
      message: 'Doğrulama kodu email adresinize gönderildi.',
    };
  }
);

export const verifyEmailCode = onCall(
  { region: 'europe-west1' },
  async (request) => {
    const { email, code } = request.data;

    if (!email || !code) {
      throw new HttpsError('invalid-argument', 'Email ve kod gerekli.');
    }

    const result = await verifyCodeFromStore(email, code, 'email');

    if (!result.success) {
      throw new HttpsError('invalid-argument', result.message);
    }

    return result;
  }
);

// ==================== SMS FUNCTIONS ====================

export const sendSmsVerification = onCall(
  { region: 'europe-west1' },  // Twilio secrets will be added later
  async (request) => {
    const { phone } = request.data;

    if (!phone) {
      throw new HttpsError('invalid-argument', 'Telefon numarası gerekli.');
    }

    // Validate phone format (Turkish format)
    const phoneRegex = /^\+90[0-9]{10}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      throw new HttpsError('invalid-argument', 'Geçersiz telefon numarası formatı.');
    }

    // Rate limiting
    const existingDoc = await db.collection('verificationCodes').doc(`phone_${cleanPhone}`).get();
    if (existingDoc.exists) {
      const docData = existingDoc.data()!;
      const createdAt = docData.createdAt?.toDate();
      if (createdAt && Date.now() - createdAt.getTime() < 60000) {
        throw new HttpsError(
          'resource-exhausted',
          'Lütfen yeni kod istemeden önce 1 dakika bekleyin.'
        );
      }
    }

    const code = generateVerificationCode();

    // Store code
    await storeVerificationCode(cleanPhone, code, 'phone');

    // Send SMS via Twilio (optional - will be configured later)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && phoneNumber) {
      const twilioClient = twilio(accountSid, authToken);
      try {
        await twilioClient.messages.create({
          body: `turing doğrulama kodunuz: ${code}. Bu kod 10 dakika geçerlidir.`,
          from: phoneNumber,
          to: cleanPhone,
        });
      } catch (error: any) {
        console.error('Twilio Error:', error);
        throw new HttpsError('internal', 'SMS gönderilemedi. Lütfen tekrar deneyin.');
      }
    } else {
      // Development mode - just log the code
      console.log(`[DEV MODE] SMS verification code for ${cleanPhone}: ${code}`);
    }

    return {
      success: true,
      message: 'Doğrulama kodu telefonunuza gönderildi.',
    };
  }
);

export const verifySmsCode = onCall(
  { region: 'europe-west1' },
  async (request) => {
    const { phone, code } = request.data;

    if (!phone || !code) {
      throw new HttpsError('invalid-argument', 'Telefon ve kod gerekli.');
    }

    const cleanPhone = phone.replace(/\s/g, '');
    const result = await verifyCodeFromStore(cleanPhone, code, 'phone');

    if (!result.success) {
      throw new HttpsError('invalid-argument', result.message);
    }

    return result;
  }
);

// ==================== TEAM INVITATION ====================

export const sendTeamInvitation = onCall(
  { secrets: [resendApiKey], region: 'europe-west1' },
  async (request) => {
    const { email, inviterName, companyName, roleName, message, invitationToken } = request.data;

    if (!email || !companyName || !inviterName) {
      throw new HttpsError('invalid-argument', 'Email, firma adı ve davet eden kişi adı gerekli.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'Geçersiz email formatı.');
    }

    console.log(`📧 Sending team invitation to ${email} for company ${companyName}`);

    // Send email via Resend
    const apiKey = resendApiKey.value();
    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        const webLink = `https://turingtr.com/invitation?token=${invitationToken || 'pending'}`;

        const result = await resend.emails.send({
          from: 'turing <noreply@turingtr.com>',
          to: email,
          subject: `${inviterName} sizi ${companyName} ekibine davet ediyor`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4b30b8; margin: 0;">turing</h1>
              </div>
              <div style="background: linear-gradient(135deg, #4b30b8 0%, #a855f7 100%); border-radius: 16px; padding: 30px; text-align: center; color: white;">
                <h2 style="margin: 0 0 10px 0;">Ekip Daveti</h2>
                <p style="margin: 0 0 20px 0; opacity: 0.9; font-size: 16px;">
                  <strong>${inviterName}</strong> sizi <strong>${companyName}</strong> ekibine davet ediyor.
                </p>
                ${roleName ? `<p style="margin: 0 0 20px 0; opacity: 0.8; font-size: 14px;">Rol: ${roleName}</p>` : ''}
                ${message ? `
                <div style="background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
                  <p style="margin: 0; font-size: 14px; font-style: italic;">"${message}"</p>
                </div>
                ` : ''}
              </div>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${webLink}" style="display: inline-block; background: #4b30b8; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Daveti Kabul Et
                </a>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                Bu daveti kabul etmek için turing uygulamasını açın veya yukarıdaki butona tıklayın.
              </p>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                Bu davet 7 gün içinde geçerliliğini yitirecektir.<br/>
                Eğer bu daveti siz istemediyseniz, bu emaili görmezden gelebilirsiniz.
              </p>
            </div>
          `,
        });
        console.log('📧 Invitation email sent:', JSON.stringify(result));
        return { success: true, message: 'Davet emaili gönderildi.' };
      } catch (error: any) {
        console.error('❌ Resend Error:', error);
        throw new HttpsError('internal', 'Email gönderilemedi. Lütfen tekrar deneyin.');
      }
    } else {
      console.log(`⚠️ No Resend API key configured - invitation email not sent to ${email}`);
      return { success: false, message: 'Email servisi yapılandırılmamış.' };
    }
  }
);

// ==================== CLEANUP FUNCTION ====================

// Clean up expired verification codes (run every hour)
// Temporarily disabled due to pubsub service identity issue
// export const cleanupExpiredCodes = onSchedule(
//   { schedule: 'every 60 minutes', region: 'europe-west1' },
//   async () => {
//     const now = admin.firestore.Timestamp.now();
//     const expiredDocs = await db
//       .collection('verificationCodes')
//       .where('expiresAt', '<', now)
//       .get();

//     const batch = db.batch();
//     expiredDocs.forEach((doc) => {
//       batch.delete(doc.ref);
//     });

//     await batch.commit();
//     console.log(`Cleaned up ${expiredDocs.size} expired verification codes`);
//   }
// );
