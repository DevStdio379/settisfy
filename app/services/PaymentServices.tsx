import firestore from '@react-native-firebase/firestore';

export interface Payment {
  id?: string;
  accountHolder: string;       // Full Name
  bankName: string;            // Issuing Bank
  accountNumber: string;       // Bank Account Number
  accountType: 'personal' | 'business';
  createdAt: any;              // Firestore Timestamp
  updatedAt: any;              // Firestore Timestamp
}

/**
 * Save user's bank/payment details to Firestore (React Native Firebase)
 * Subcollection: users/{userId}/payments
 */
export const saveUserPayment = async (userId: string, paymentData: Payment) => {
  try {
    const userPaymentsRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('payments');

    const paymentToSave = { ...paymentData };
    if (paymentToSave.id) delete paymentToSave.id;

    await userPaymentsRef.add({
      ...paymentToSave,
      createdAt: paymentData.createdAt || firestore.FieldValue.serverTimestamp(),
      updatedAt: paymentData.updatedAt || firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Payment details saved successfully!');
  } catch (error) {
    console.error('❌ Error saving payment details:', error);
  }
};

/**
 * Fetch all payment details of a user
 */
export const fetchUserPayments = async (userId: string): Promise<Payment[]> => {
  try {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('payments')
      .get();

    const payments: Payment[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      if (!data) {
        console.warn('⚠️ Payment document has no data, skipping.');
        return {
          id: docSnap.id,
          accountHolder: '',
          bankName: '',
          accountNumber: '',
          accountType: 'personal',
          createdAt: null,
          updatedAt: null,
        } as Payment;
      }
      return {
        id: docSnap.id,
        accountHolder: data.accountHolder,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return payments;
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    return [];
  }
};

/**
 * Fetch a single payment record by ID (e.g., when editing)
 */
export const fetchSingleUserPayment = async (
  userId: string,
  paymentId: string
): Promise<Payment | null> => {
  try {
    const docSnap = await firestore()
      .collection('users')
      .doc(userId)
      .collection('payments')
      .doc(paymentId)
      .get();

    const data = docSnap.data();
    if (!data) {
      console.warn('⚠️ Payment document has no data.');
      return null;
    }

    return {
      id: docSnap.id,
      accountHolder: data.accountHolder,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountType: data.accountType,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Payment;
  } catch (error) {
    console.error('❌ Error fetching payment record:', error);
    return null;
  }
};

/**
 * Update a user’s payment record
 */
export const updateUserPayment = async (
  userId: string,
  paymentId: string,
  paymentData: Partial<Payment>
): Promise<boolean> => {
  try {
    const paymentRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('payments')
      .doc(paymentId);

    const paymentDoc = await paymentRef.get();
    if (!paymentDoc.exists) {
      console.log('⚠️ No such payment record found!');
      return false;
    }

    const dataToUpdate: any = { ...paymentData };
    if (dataToUpdate.id) delete dataToUpdate.id;

    await paymentRef.update({
      ...dataToUpdate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Payment updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating payment:', error);
    return false;
  }
};

/**
 * Delete a payment record for a user
 * Subcollection: users/{userId}/payments/{paymentId}
 */
export const deleteUserPayment = async (
  userId: string,
  paymentId: string
): Promise<boolean> => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('payments')
      .doc(paymentId)
      .delete();

    console.log('✅ Payment deleted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error deleting payment:', error);
    return false;
  }
};
