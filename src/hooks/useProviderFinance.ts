import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export interface FinancialSummary {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayments: number;
  completedJobs: number;
  averageJobValue: number;
  growthPercentage: number;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: Date;
  eventTitle?: string;
  status: 'completed' | 'pending' | 'processing';
}

export interface ServiceIncome {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

/**
 * Hook to fetch provider's financial data from Firebase
 * Calculates earnings from accepted offers and signed contracts
 */
export function useProviderFinance(providerId: string | undefined) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      setOffers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query accepted offers for this provider
    const offersQuery = query(
      collection(db, 'offers'),
      where('providerId', '==', providerId),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(
      offersQuery,
      (snapshot) => {
        const offersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(offersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Error fetching provider finance data:', err);
        setError('Finansal veriler yüklenirken hata oluştu');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [providerId]);

  // Calculate financial summary from offers
  const summary = useMemo((): FinancialSummary => {
    if (!offers.length) {
      return {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        pendingPayments: 0,
        completedJobs: 0,
        averageJobValue: 0,
        growthPercentage: 0,
      };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let totalEarnings = 0;
    let thisMonthEarnings = 0;
    let lastMonthEarnings = 0;
    let pendingPayments = 0;
    let completedJobs = 0;

    offers.forEach(offer => {
      const amount = offer.finalAmount || offer.counterAmount || offer.amount || 0;
      const isContractSigned = offer.contractSigned === true ||
        (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);

      // Check offer date
      let offerDate: Date | null = null;
      if (offer.createdAt) {
        offerDate = offer.createdAt instanceof Timestamp
          ? offer.createdAt.toDate()
          : new Date(offer.createdAt);
      }

      if (isContractSigned) {
        totalEarnings += amount;
        completedJobs++;

        // Check if this month
        if (offerDate) {
          if (offerDate.getMonth() === thisMonth && offerDate.getFullYear() === thisYear) {
            thisMonthEarnings += amount;
          }
          if (offerDate.getMonth() === lastMonth && offerDate.getFullYear() === lastMonthYear) {
            lastMonthEarnings += amount;
          }
        }
      } else {
        // Accepted but contract not fully signed = pending payment
        pendingPayments += amount;
      }
    });

    const averageJobValue = completedJobs > 0 ? Math.round(totalEarnings / completedJobs) : 0;

    // Calculate growth percentage
    let growthPercentage = 0;
    if (lastMonthEarnings > 0) {
      growthPercentage = Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100);
    } else if (thisMonthEarnings > 0) {
      growthPercentage = 100; // If no last month data but has this month, 100% growth
    }

    return {
      totalEarnings,
      thisMonthEarnings,
      pendingPayments,
      completedJobs,
      averageJobValue,
      growthPercentage,
    };
  }, [offers]);

  // Calculate monthly earnings for chart (last 6 months)
  const monthlyEarnings = useMemo((): MonthlyEarning[] => {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const now = new Date();
    const result: MonthlyEarning[] = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      let monthTotal = 0;
      offers.forEach(offer => {
        const isContractSigned = offer.contractSigned === true ||
          (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);

        if (!isContractSigned) return;

        let offerDate: Date | null = null;
        if (offer.createdAt) {
          offerDate = offer.createdAt instanceof Timestamp
            ? offer.createdAt.toDate()
            : new Date(offer.createdAt);
        }

        if (offerDate && offerDate.getMonth() === month && offerDate.getFullYear() === year) {
          monthTotal += offer.finalAmount || offer.counterAmount || offer.amount || 0;
        }
      });

      result.push({
        month: months[month],
        amount: monthTotal,
      });
    }

    return result;
  }, [offers]);

  // Calculate income by service category
  const incomeByService = useMemo((): ServiceIncome[] => {
    const categoryColors: Record<string, string> = {
      'booking': '#4B30B8',
      'artist': '#4B30B8',
      'technical': '#3B82F6',
      'sound-light': '#3B82F6',
      'catering': '#10B981',
      'security': '#F59E0B',
      'other': '#6B7280',
    };

    const categoryNames: Record<string, string> = {
      'booking': 'Sanatçı Booking',
      'artist': 'Sanatçı Booking',
      'technical': 'Teknik Hizmet',
      'sound-light': 'Ses & Işık',
      'catering': 'Catering',
      'security': 'Güvenlik',
      'other': 'Diğer',
    };

    const categoryTotals: Record<string, number> = {};
    let grandTotal = 0;

    offers.forEach(offer => {
      const isContractSigned = offer.contractSigned === true ||
        (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);

      if (!isContractSigned) return;

      const category = offer.serviceCategory || 'other';
      const amount = offer.finalAmount || offer.counterAmount || offer.amount || 0;

      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      grandTotal += amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category: categoryNames[category] || category,
      amount,
      percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
      color: categoryColors[category] || '#6B7280',
    })).sort((a, b) => b.amount - a.amount);
  }, [offers]);

  // Create transactions list from offers
  const transactions = useMemo((): FinancialTransaction[] => {
    return offers
      .filter(offer => {
        const isContractSigned = offer.contractSigned === true ||
          (offer.contractSignedByOrganizer === true && offer.contractSignedByProvider === true);
        return isContractSigned;
      })
      .map(offer => {
        let date = new Date();
        if (offer.createdAt) {
          date = offer.createdAt instanceof Timestamp
            ? offer.createdAt.toDate()
            : new Date(offer.createdAt);
        }

        return {
          id: offer.id,
          type: 'income' as const,
          amount: offer.finalAmount || offer.counterAmount || offer.amount || 0,
          description: `${offer.serviceCategory || 'Hizmet'} - ${offer.eventTitle || 'Etkinlik'}`,
          date,
          eventTitle: offer.eventTitle,
          status: 'completed' as const,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [offers]);

  return {
    summary,
    monthlyEarnings,
    incomeByService,
    transactions,
    loading,
    error,
  };
}
