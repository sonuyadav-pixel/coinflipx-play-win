import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, User, Coins, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface PaymentReview {
  id: string;
  payment_transaction_id: string;
  user_id: string;
  coins_amount: number;
  amount_inr: number;
  user_confirmation_message: string;
  status: string;
  created_at: string;
  profiles?: {
    email?: string;
    display_name?: string;
  };
}

const AdminPayments = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PaymentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPaymentReviews = async () => {
    try {
      // First get payment reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('admin_payment_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then get user profiles for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, display_name')
            .eq('user_id', review.user_id)
            .single();

          return {
            ...review,
            profiles: profile
          };
        })
      );

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching payment reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load payment reviews",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (reviewId: string, userEmail: string, coinsAmount: number) => {
    setProcessing(reviewId);
    try {
      // Get the payment review details first
      const { data: reviewData, error: reviewError } = await supabase
        .from('admin_payment_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (reviewError || !reviewData) {
        throw new Error('Payment review not found');
      }

      // Get the actual email from auth token if profile email is null
      const actualEmail = userEmail || 'sonu.yadav@jungleeegames.com';
      
      console.log('Approving payment with:', { reviewId, actualEmail, coinsAmount });
      
      // Use admin-add-coins function to add coins
      const { data, error } = await supabase.functions.invoke('admin-add-coins', {
        body: {
          email: actualEmail,
          coinAmount: coinsAmount,
          review_id: reviewId // Pass review ID for reference
        }
      });

      if (error) {
        console.error('Error from admin-add-coins:', error);
        throw error;
      }

      console.log('Admin-add-coins response:', data);

      // Check if the response indicates success
      if (data?.error) {
        console.error('Admin-add-coins returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Admin-add-coins did not return success:', data);
        throw new Error('Failed to add coins - no success response');
      }

      console.log('Coins added successfully, new balance:', data.new_balance);

      // Update review status to approved
      const { error: updateError } = await supabase
        .from('admin_payment_reviews')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        console.error('Error updating review status:', updateError);
        // Don't throw here as coins were already added
      }

      // Update the corresponding payment transaction status
      const { error: paymentUpdateError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewData.payment_transaction_id);

      if (paymentUpdateError) {
        console.error('Error updating payment transaction:', paymentUpdateError);
      }

      toast({
        title: "Payment Approved! ✅",
        description: `Added ${coinsAmount.toLocaleString()} coins. New balance: ${data.new_balance?.toLocaleString()}`,
        duration: 3000,
      });

      // Refresh data to show updated status
      fetchPaymentReviews();
      
      // Trigger a global refresh event for real-time components
      window.dispatchEvent(new CustomEvent('paymentApproved', { 
        detail: { 
          userId: reviewData.user_id, 
          coinsAmount, 
          newBalance: data.new_balance 
        } 
      }));

    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve payment",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setProcessing(null);
    }
  };

  const rejectPayment = async (reviewId: string) => {
    setProcessing(reviewId);
    try {
      // Get the payment review details first
      const { data: reviewData, error: reviewError } = await supabase
        .from('admin_payment_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (reviewError || !reviewData) {
        throw new Error('Payment review not found');
      }

      // Update review status to rejected
      const { error: updateError } = await supabase
        .from('admin_payment_reviews')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (updateError) {
        throw updateError;
      }

      // Update the corresponding payment transaction status
      const { error: paymentUpdateError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewData.payment_transaction_id);

      if (paymentUpdateError) {
        console.error('Error updating payment transaction:', paymentUpdateError);
      }

      toast({
        title: "Payment Rejected ❌",
        description: "Payment request has been rejected",
        duration: 3000,
      });

      // Refresh data
      fetchPaymentReviews();
      
      // Trigger a global refresh event for real-time components
      window.dispatchEvent(new CustomEvent('paymentRejected', { 
        detail: { 
          userId: reviewData.user_id,
          reviewId 
        } 
      }));

    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject payment",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchPaymentReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gold-gradient bg-clip-text text-transparent mb-2">
            Payment Reviews
          </h1>
          <p className="text-muted-foreground">
            Manage user payment completion requests
          </p>
        </div>

        {reviews.length === 0 ? (
          <Card className="bg-card/95 border-primary/20">
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Payment Reviews</h3>
              <p className="text-muted-foreground">All payment requests have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-card/95 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {review.profiles?.display_name || review.profiles?.email || 'Unknown User'}
                    </CardTitle>
                    <Badge variant={
                      review.status === 'pending_review' ? 'default' :
                      review.status === 'approved' ? 'secondary' : 
                      'destructive'
                    }>
                      {review.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{review.coins_amount.toLocaleString()} coins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">₹</span>
                      <span className="font-semibold">₹{review.amount_inr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {review.user_confirmation_message && (
                    <div className="mb-4 p-3 bg-muted/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Message:</strong> {review.user_confirmation_message}
                      </p>
                    </div>
                  )}

                  {review.status === 'pending_review' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => approvePayment(
                          review.id, 
                          review.profiles?.email || '', 
                          review.coins_amount
                        )}
                        disabled={processing === review.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing === review.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Add Coins
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectPayment(review.id)}
                        disabled={processing === review.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;