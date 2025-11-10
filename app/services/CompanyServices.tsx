import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Company {
  id?: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  businessRegNo: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Save new company info for a user
 * Stored in: users/{userId}/companyInfo/{autoId}
 */
export const saveCompanyInfo = async (userId: string, companyData: Company) => {
  try {
    const userCompanyRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('companyInfo');

    const dataToSave = { ...companyData };
    delete dataToSave.id;

    await userCompanyRef.add({
      ...dataToSave,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Company information saved successfully!');
  } catch (error) {
    console.error('❌ Error saving company info:', error);
    throw error;
  }
};

/**
 * Fetch the first (and only) company info of a user.
 * Returns `null` if not found.
 */
export const fetchCompanyInfo = async (userId: string): Promise<Company | null> => {
  try {
    const querySnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('companyInfo')
      .get();

    if (querySnapshot.empty) {
      console.log('ℹ️ No company information found for this user.');
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      companyName: data.companyName,
      companyAddress: data.companyAddress,
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      businessRegNo: data.businessRegNo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Company;
  } catch (error) {
    console.error('❌ Error fetching company info:', error);
    return null;
  }
};

/**
 * Update existing company info for a user
 */
export const updateCompanyInfo = async (
  userId: string,
  companyId: string,
  companyData: Partial<Company>
): Promise<boolean> => {
  try {
    const companyRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('companyInfo')
      .doc(companyId);

    const dataToUpdate = { ...companyData };
    delete dataToUpdate.id;

    await companyRef.update({
      ...dataToUpdate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Company information updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating company info:', error);
    return false;
  }
};

/**
 * Delete company info document
 */
export const deleteCompanyInfo = async (
  userId: string,
  companyId: string
): Promise<boolean> => {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('companyInfo')
      .doc(companyId)
      .delete();

    console.log('🗑️ Company information deleted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error deleting company info:', error);
    return false;
  }
};
