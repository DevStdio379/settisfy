import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Catalogue } from './CatalogueServices';
import { Address } from './AddressServices';

export interface SettlerService {
  id?: string;
  settlerId: string;
  settlerFirstName: string;
  settlerLastName: string;

  selectedCatalogue: Catalogue;
  serviceCardImageUrls: string[];
  serviceCardBrief: string;
  isAvailableImmediately: boolean;
  availableDays: string[];
  serviceStartTime: string;
  serviceEndTime: string;

  serviceLocation: string;
  qualifications: string[];
  isActive: boolean;
  jobsCount: number;
  averageRatings: number;
  createdAt: any;
  updatedAt: any;
}

// 🔹 Map Firestore document to SettlerService
const mapDocToSettlerService = (doc: FirebaseFirestoreTypes.DocumentSnapshot): SettlerService => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as SettlerService;
};

// 🔹 Upload multiple images to Firebase Storage
export const uploadImages = async (imageName: string, imageUris: string[]) => {
  const urls: string[] = [];

  for (const uri of imageUris) {
    try {
      const filename = `settler_services/${imageName}_${imageUris.indexOf(uri)}.jpg`;
      const reference = storage().ref(filename);

      // React Native Firebase uses putFile() instead of uploadBytes()
      const uploadTask = reference.putFile(uri);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', taskSnapshot => {
          const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
          console.log(`Uploading ${filename}: ${progress.toFixed(2)}% done`);
        });

        uploadTask.then(async () => {
          const downloadURL = await reference.getDownloadURL();
          urls.push(downloadURL);
          resolve();
        }).catch(reject);
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  console.log('All images uploaded:', urls);
  return urls;
};

// 🔹 Create new Settler Service document
export const createSettlerService = async (serviceData: SettlerService) => {
  try {
    const serviceRef = firestore().collection('settler_services');
    const docRef = await serviceRef.add({
      ...serviceData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    // Upload images if any
    if (serviceData.serviceCardImageUrls?.length > 0) {
      const uploadedUrls = await uploadImages(docRef.id, serviceData.serviceCardImageUrls);
      await docRef.update({ serviceCardImageUrls: uploadedUrls });
    }

    console.log('Settler service saved successfully');
  } catch (error) {
    console.error('Error saving settler service:', error);
    throw error;
  }
};

// 🔹 Fetch all Settler Services by user ID
export const fetchSettlerServices = async (userId: string): Promise<SettlerService[]> => {
  try {
    const snapshot = await firestore()
      .collection('settler_services')
      .where('settlerId', '==', userId)
      .get();

    return snapshot.docs.map(doc => mapDocToSettlerService(doc));
  } catch (error) {
    console.error('Error fetching settler services:', error);
    throw error;
  }
};

// 🔹 Fetch one specific Settler Service by ID
export const fetchSelectedSettlerService = async (settlerServiceId: string): Promise<SettlerService | null> => {
  try {
    const doc = await firestore().collection('settler_services').doc(settlerServiceId).get();

    if (doc.exists()) {
      return mapDocToSettlerService(doc);
    }

    console.log('No such selected settler service exists.');
    return null;
  } catch (error) {
    console.error('Error fetching selected settler service:', error);
    throw error;
  }
};

// 🔹 Update Settler Service
export const updateSettlerService = async (settlerServiceId: string, updatedSettlerService: Partial<SettlerService>) => {
  try {
    await firestore()
      .collection('settler_services')
      .doc(settlerServiceId)
      .update({
        ...updatedSettlerService,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

    console.log('Settler service updated successfully');
  } catch (error) {
    console.error('Error updating settler service:', error);
    throw error;
  }
};

// 🔹 Delete Settler Service
export const deleteSettlerService = async (serviceId: string) => {
  try {
    await firestore().collection('settler_services').doc(serviceId).delete();
    console.log('Settler service deleted successfully');
  } catch (error) {
    console.error('Error deleting settler service:', error);
    throw error;
  }
};
