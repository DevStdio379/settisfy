import firestore, { doc, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export interface SubOption {
  id?: number;
  label: string;
  additionalPrice: number;
  notes?: string;
  isCompleted?: boolean;
}

export interface DynamicOption {
  id?: number;
  name: string;
  subOptions: SubOption[];
  multipleSelect: boolean;
}

export interface Catalogue {
  id?: string;
  imageUrls: string[];
  title: string;
  description: string;
  includedServices: string;
  excludedServices: string;
  category: string;
  basePrice: number;
  coolDownPeriodHours: number;
  dynamicOptions: DynamicOption[];
  isActive: boolean;
  bookingsCount: number;
  averageRatings: number;
  createAt: any;
  updateAt: any;
}

/**
 * Upload catalogue images to Firebase Storage (React Native)
 */
export const uploadImages = async (imageName: string, imagesUrl: string[]) => {
  const urls: string[] = [];

  for (const uri of imagesUrl) {
    try {
      const filename = `catalogue_assets/${imageName}_${imagesUrl.indexOf(uri)}.jpg`;
      const reference = storage().ref(filename);

      // Upload the file
      const task = reference.putFile(uri);

      await new Promise<void>((resolve, reject) => {
        task.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload ${filename}: ${progress.toFixed(2)}% done`);
          },
          reject,
          async () => {
            const downloadURL = await reference.getDownloadURL();
            urls.push(downloadURL);
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  console.log('All images uploaded:', urls);
  return urls;
};

/**
 * Create a new catalogue document
 */
export const createCatalogue = async (data: Catalogue) => {
  try {
    const serviceRef = firestore().collection('catalogue');
    const docRef = await serviceRef.add({
      ...data,
      createAt: firestore.FieldValue.serverTimestamp(),
      updateAt: firestore.FieldValue.serverTimestamp(),
    });

    if (data.imageUrls?.length) {
      const uploadedUrls = await uploadImages(docRef.id, data.imageUrls);
      await docRef.update({ imageUrls: uploadedUrls });
    }

    console.log('Catalogue saved successfully');
  } catch (error) {
    console.error('Error saving catalogue:', error);
    throw error;
  }
};

/**
 * Map Firestore document to Catalogue object
 */
const mapDocToCatalogue = (doc: FirebaseFirestoreTypes.DocumentSnapshot): Catalogue => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    imageUrls: data.imageUrls || [],
    title: data.title || '',
    description: data.description || '',
    includedServices: data.includedServices || '',
    excludedServices: data.excludedServices || '',
    category: data.category || '',
    basePrice: data.basePrice || 0,
    coolDownPeriodHours: data.coolDownPeriodHours || 0,
    dynamicOptions: data.dynamicOptions || [],
    isActive: data.isActive ?? true,
    bookingsCount: data.bookingsCount || 0,
    averageRatings: data.averageRatings || 0,
    createAt: data.createAt,
    updateAt: data.updateAt,
  };
};

/**
 * Fetch all active catalogues
 */
export const fetchCatalogue = async (): Promise<Catalogue[]> => {
  try {
    const snapshot = await firestore().collection('catalogue').get();
    return snapshot.docs
      .map(mapDocToCatalogue)
      .filter((catalogue) => catalogue.isActive);
  } catch (error) {
    console.error('Error fetching catalogue:', error);
    throw error;
  }
};

/**
 * Fetch all catalogues (including inactive)
 */
export const fetchAllCatalogue = async (): Promise<Catalogue[]> => {
  try {
    const snapshot = await firestore().collection('catalogue').get();
    return snapshot.docs.map(mapDocToCatalogue);
  } catch (error) {
    console.error('Error fetching all catalogues:', error);
    throw error;
  }
};

/**
 * Fetch single catalogue by ID
 */
export const fetchSelectedCatalogue = async (serviceId: string): Promise<Catalogue | null> => {
  try {
    const docSnap = await firestore().collection('catalogue').doc(serviceId).get();
    return docSnap.exists() ? mapDocToCatalogue(docSnap) : null;
  } catch (error) {
    console.error('Error fetching selected catalogue:', error);
    throw error;
  }
};

/**
 * Search catalogues by keyword
 */
export const searchServices = async (queryStr: string): Promise<Catalogue[]> => {
  try {
    if (queryStr.length < 3) return [];
    const lowerCaseQuery = queryStr.toLowerCase();

    const snapshot = await firestore().collection('catalogue').get();
    const allServices = snapshot.docs.map(mapDocToCatalogue);

    return allServices.filter(
      (product) =>
        product.isActive &&
        (
          product.title.toLowerCase().includes(lowerCaseQuery) ||
          product.description.toLowerCase().includes(lowerCaseQuery) ||
          product.category.toLowerCase().includes(lowerCaseQuery)
        )
    );
  } catch (error) {
    console.error('Error searching catalogues:', error);
    throw error;
  }
};

/**
 * Update catalogue
 */
export const updateCatalogue = async (catalogueId: string, updatedCatalogue: Partial<Catalogue>) => {
  try {
    const docRef = firestore().collection('catalogue').doc(catalogueId);

    if (updatedCatalogue.imageUrls?.length) {
      // Separate local images (new uploads) from existing URLs
      const localImages = updatedCatalogue.imageUrls.filter((uri) => !uri.startsWith('https://'));
      const existingUrls = updatedCatalogue.imageUrls.filter((uri) => uri.startsWith('https://'));

      let uploadedUrls: string[] = [];
      if (localImages.length > 0) {
        uploadedUrls = await uploadImages(docRef.id, localImages);
      }

      // Merge existing URLs with newly uploaded ones
      const finalImageUrls = [...existingUrls, ...uploadedUrls];

      await docRef.update({ ...updatedCatalogue, imageUrls: finalImageUrls });
    } else {
      await docRef.update({ ...updatedCatalogue, updateAt: firestore.FieldValue.serverTimestamp() });
    }

    console.log('Catalogue updated successfully');
  } catch (error) {
    console.error('Error updating catalogue:', error);
    throw error;
  }
};

/**
 * Delete catalogue
 */
export const deleteCatalogue = async (catalogueId: string) => {
  try {
    await firestore().collection('catalogue').doc(catalogueId).delete();
    console.log('Catalogue deleted successfully');
  } catch (error) {
    console.error('Error deleting catalogue:', error);
    throw error;
  }
};
