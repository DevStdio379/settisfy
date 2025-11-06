import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Address {
  id?: string;
  latitude: number;
  longitude: number;
  addressName: string;
  address: string;
  buildingType: string;
  fullAddress: string;
  postcode: string;
  addressLabel: string;
  phoneNumber: string;
  createAt?: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
}

/* 🔹 Save a new user address */
export const saveUserAddress = async (userId: string, addressData: Address) => {
  try {
    const userAddressesRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('addresses');

    const addressToSave = { ...addressData };
    if (!addressToSave.id) delete addressToSave.id;

    await userAddressesRef.add({
      ...addressToSave,
      createAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('Address saved successfully!');
  } catch (error) {
    console.error('Error saving address:', error);
  }
};

/* 🔹 Fetch all addresses for a user */
export const fetchUserAddresses = async (userId: string): Promise<Address[]> => {
  try {
    const userAddressesRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('addresses');

    const querySnapshot = await userAddressesRef.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Address),
    }));
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
};

/* 🔹 Get a single user address by ID */
export const getUserAddressById = async (
  userId: string,
  addressId: string
): Promise<Address | null> => {
  try {
    const addressRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('addresses')
      .doc(addressId);

    const snapshot = await addressRef.get();
    if (!snapshot.exists) return null;

    return { id: snapshot.id, ...(snapshot.data() as Address) };
  } catch (error) {
    console.error('Error fetching selected user address:', error);
    return null;
  }
};

/* 🔹 Update a user address */
export const updateUserAddress = async (
  userId: string,
  addressId: string,
  updatedData: Partial<Address>
): Promise<boolean> => {
  try {
    const addressRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('addresses')
      .doc(addressId);

    const dataToUpdate = { ...updatedData };
    if ('id' in dataToUpdate) delete dataToUpdate.id;

    await addressRef.update({
      ...dataToUpdate,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('Address updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
};

/* 🔹 Delete a user address */
export const deleteUserAddress = async (
  userId: string,
  addressId: string
): Promise<boolean> => {
  try {
    const addressRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('addresses')
      .doc(addressId);

    await addressRef.delete();
    console.log('Address deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
};

/* 🔹 Fetch a product owner's address */
export const fetchProductAddress = async (
  ownerId: string,
  addressId: string
): Promise<Address | null> => {
  try {
    const addressRef = firestore()
      .collection('users')
      .doc(ownerId)
      .collection('addresses')
      .doc(addressId);

    const docSnap = await addressRef.get();
    if (!docSnap.exists) return null;

    return { id: docSnap.id, ...(docSnap.data() as Address) };
  } catch (error) {
    console.error('Error fetching product address:', error);
    return null;
  }
};
