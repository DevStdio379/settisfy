// /Users/afiqismail/Documents/personal_project/settisfy_app/app/services/BookingServices.tsx
// Converted to React Native Firebase (mobile) SDK only

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Address } from './AddressServices';
import { Catalogue, DynamicOption } from './CatalogueServices';
import { User } from '../context/UserContext';
import { SettlerService } from './SettlerServiceServices';

export enum BookingActivityType {
  NOTES_TO_SETTLER_UPDATED = 'NOTES_TO_SETTLER_UPDATED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  QUOTE_CREATED = 'QUOTE_CREATED',
  SETTLER_ACCEPT = 'SETTLER_ACCEPT',
  SETTLER_SELECTED = 'SETTLER_SELECTED',
  SETTLER_SERVICE_START = 'SETTLER_SERVICE_START',
  SETTLER_SERVICE_END = 'SETTLER_SERVICE_END',
  SETTLER_EVIDENCE_SUBMITTED = 'SETTLER_EVIDENCE_SUBMITTED',
  SETTLER_EVIDENCE_UPDATED = 'SETTLER_EVIDENCE_UPDATED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  JOB_INCOMPLETE = 'JOB_INCOMPLETE',
  CUSTOMER_JOB_INCOMPLETE_UPDATED = 'CUSTOMER_JOB_INCOMPLETE_UPDATED',
  CUSTOMER_REJECT_INCOMPLETION_RESOLVE = 'CUSTOMER_REJECT_INCOMPLETION_RESOLVE',
  SETTLER_RESOLVE_INCOMPLETION = 'SETTLER_RESOLVE_INCOMPLETION',
  SETTLER_UPDATE_INCOMPLETION_EVIDENCE = 'SETTLER_UPDATE_INCOMPLETION_EVIDENCE',
  SETTLER_REJECT_INCOMPLETION = 'SETTLER_REJECT_INCOMPLETION',
  CUSTOMER_CONFIRM_COMPLETION = 'CUSTOMER_CONFIRM_COMPLETION',
  COOLDOWN_REPORT_SUBMITTED = 'COOLDOWN_REPORT_SUBMITTED',
  CUSTOMER_COOLDOWN_REPORT_UPDATED = 'CUSTOMER_COOLDOWN_REPORT_UPDATED',
  SETTLER_RESOLVE_COOLDOWN_REPORT = 'SETTLER_RESOLVE_COOLDOWN_REPORT',
  SETTLER_UPDATE_COOLDOWN_REPORT_EVIDENCE = 'SETTLER_UPDATE_COOLDOWN_REPORT_EVIDENCE',
  CUSTOMER_COOLDOWN_REPORT_NOT_RESOLVED = 'CUSTOMER_COOLDOWN_REPORT_NOT_RESOLVED',
  COOLDOWN_REPORT_COMPLETED = 'COOLDOWN_REPORT_COMPLETED',
  SETTLER_REJECT_COOLDOWN_REPORT = 'SETTLER_REJECT_COOLDOWN_REPORT',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  BOOKING_CANCELLED_BY_CUSTOMER = 'BOOKING_CANCELLED_BY_CUSTOMER',
  BOOKING_CANCELLED_BY_SETTLER = 'BOOKING_CANCELLED_BY_SETTLER',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  SETTLER_QUOTE_UPDATED = 'SETTLER_QUOTE_UPDATED',
}

export enum BookingActorType {
  SETTLER = 'SETTLER',
  CUSTOMER = 'CUSTOMER',
  SYSTEM = 'SYSTEM',
}

export interface BookingActivity {
  id: string;
  type: BookingActivityType;
  timestamp: any;
  actor: BookingActorType;
}

export interface Acceptor {
  settlerId: string;
  settlerServiceId: string;
  firstName: string;
  lastName: string;
  acceptedAt: string;
}

export interface Booking {
  id?: string;
  userId: string;
  status: number | string;
  selectedDate: string;
  selectedAddress: Address;
  firstName: string;
  lastName: string;
  catalogueService: Catalogue;
  total: number;
  addons?: DynamicOption[];
  paymentMethod: string;
  paymentIntentId?: string;
  paymentEvidence?: string[];
  paymentStatus?: string;
  notesToSettlerImageUrls?: string[];
  notesToSettler?: string;
  notesToSettlerStatus?: string;
  manualQuoteDescription: string;
  manualQuotePrice: number;
  isManualQuoteCompleted?: boolean;
  newAddons?: DynamicOption[];
  newManualQuoteDescription?: string;
  newManualQuotePrice?: number;
  newTotal?: number;
  incompletionReportImageUrls?: string[];
  incompletionReportRemark?: string;
  incompletionStatus?: string;
  incompletionResolvedImageUrls?: string[];
  incompletionResolvedRemark?: string;
  cooldownReportImageUrls?: string[];
  cooldownReportRemark?: string;
  cooldownStatus?: string;
  cooldownResolvedImageUrls?: string[];
  cooldownResolvedRemark?: string;
  isQuoteUpdateSuccess?: boolean;
  acceptors?: Acceptor[];
  settlerId?: string;
  settlerServiceId: string;
  settlerFirstName?: string;
  settlerLastName?: string;
  settlerEvidenceImageUrls: string[];
  settlerEvidenceRemark: string;
  serviceStartCode: string;
  serviceEndCode: string;
  problemReportRemark?: string;
  problemReportImageUrls?: string[];
  problemReportIsCompleted?: boolean;
  cancelReasons?: string[];
  cancelReasonText?: string;
  cancelReasonImageUrls?: string[];
  cancelActor?: BookingActorType;
  timeline: any[];
  createAt: any;
  updatedAt: any;
}

export interface BookingWithUser extends Booking {
  settlerProfile: User | null;
  settlerJobProfile: SettlerService | null;
}

// Helper: upload local file URIs to RN Firebase Storage and return download URLs
const uploadLocalUris = async (prefix: string, imagesUrl: string[]) => {
  const urls: string[] = [];
  for (let i = 0; i < imagesUrl.length; i++) {
    const uri = imagesUrl[i];
    try {
      // filename and storage ref
      const filename = `${prefix}_${i}.jpg`;
      const storageRef = storage().ref(`bookings/${filename}`);

      // putFile accepts file:// URIs on React Native
      await storageRef.putFile(uri);
      const downloadURL = await storageRef.getDownloadURL();
      urls.push(downloadURL);
    } catch (err) {
      console.error('Upload failed for', uri, err);
    }
  }
  return urls;
};

export const uploadPaymentEvidenceImages = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`payment_evidence_${imageName}`, imagesUrl);

export const uploadNoteToSettlerImages = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`${imageName}`, imagesUrl);

export const uploadImagesCompletionEvidence = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`evidence_${imageName}`, imagesUrl);

export const uploadBookingCancellationReason = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`cancellation_${imageName}`, imagesUrl);

export const uploadImageIncompletionEvidence = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`incompletion_evidence_${imageName}`, imagesUrl);

export const uploadImageIncompletionResolveEvidence = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`incompletion_resolve_evidence_${imageName}`, imagesUrl);

export const uploadImagesCooldownReportEvidence = async (imageName: string, imagesUrl: string[]) =>
  uploadLocalUris(`cooldown_report_${imageName}`, imagesUrl);

// Create booking using RN Firebase (firestore())
export const createBooking = async (bookingData: Booking) => {
  try {
    const bookingRef = firestore().collection('bookings');

    // create booking first
    const docRef = await bookingRef.add(bookingData);
    console.log('Booking created with ID:', docRef.id);

    // if there are local image URIs to upload
    if (bookingData.notesToSettlerImageUrls && bookingData.notesToSettlerImageUrls.length > 0) {
      const uploadedUrls = await uploadNoteToSettlerImages(docRef.id, bookingData.notesToSettlerImageUrls);

      const paymentEvidenceUrls =
        bookingData.paymentEvidence && bookingData.paymentEvidence.length > 0
          ? await uploadPaymentEvidenceImages(docRef.id, bookingData.paymentEvidence)
          : [];

      await bookingRef.doc(docRef.id).update({
        notesToSettlerImageUrls: uploadedUrls,
        paymentEvidence: paymentEvidenceUrls,
        updatedAt: firestore.FieldValue ? firestore.FieldValue.serverTimestamp() : new Date(), // best-effort
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating booking: ', error);
    throw error;
  }
};

const mapBorrowingData = (doc: any): Booking => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    status: data.status,
    selectedDate: data.selectedDate,
    selectedAddress: data.selectedAddress,
    firstName: data.firstName,
    lastName: data.lastName,
    catalogueService: data.catalogueService,
    total: data.total,
    addons: data.addons,
    paymentMethod: data.paymentMethod,
    paymentIntentId: data.paymentIntentId || '',
    paymentEvidence: data.paymentEvidence || [],
    paymentStatus: data.paymentStatus || '',
    notesToSettlerImageUrls: data.notesToSettlerImageUrls,
    notesToSettler: data.notesToSettler,
    notesToSettlerStatus: data.notesToSettlerStatus,
    newAddons: data.newAddons,
    manualQuoteDescription: data.manualQuoteDescription,
    manualQuotePrice: data.manualQuotePrice,
    isManualQuoteCompleted: data.isManualQuoteCompleted,
    newManualQuoteDescription: data.newManualQuoteDescription,
    newManualQuotePrice: data.newManualQuotePrice,
    isQuoteUpdateSuccess: data.isQuoteUpdateSuccess,
    incompletionReportImageUrls: data.incompletionReportImageUrls,
    incompletionReportRemark: data.incompletionReportRemark,
    incompletionStatus: data.incompletionStatus,
    incompletionResolvedImageUrls: data.incompletionResolvedImageUrls,
    incompletionResolvedRemark: data.incompletionResolvedRemark,
    cooldownReportImageUrls: data.cooldownReportImageUrls,
    cooldownReportRemark: data.cooldownReportRemark,
    cooldownStatus: data.cooldownStatus,
    cooldownResolvedImageUrls: data.cooldownResolvedImageUrls,
    cooldownResolvedRemark: data.cooldownResolvedRemark,
    acceptors: data.acceptors,
    settlerId: data.settlerId || '',
    settlerServiceId: data.settlerServiceId || '',
    settlerFirstName: data.settlerFirstName || '',
    settlerLastName: data.settlerLastName || '',
    settlerEvidenceImageUrls: data.settlerEvidenceImageUrls,
    settlerEvidenceRemark: data.settlerEvidenceRemark,
    serviceStartCode: data.serviceStartCode,
    serviceEndCode: data.serviceEndCode,
    timeline: data.timeline,
    problemReportRemark: data.problemReportRemark,
    problemReportImageUrls: data.problemReportImageUrls,
    problemReportIsCompleted: data.problemReportIsCompleted,
    cancelReasons: data.cancelReasons,
    cancelReasonText: data.cancelReasonText,
    cancelReasonImageUrls: data.cancelReasonImageUrls,
    cancelActor: data.cancelActor,
    createAt: data.createAt,
    updatedAt: data.updatedAt,
  };
};

export function subscribeToBookings(setJobs: (booking: Booking[]) => void) {
  const q = firestore().collection('bookings').where('status', '==', '0');
  const unsubscribe = q.onSnapshot((snap) => {
    const jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    setJobs(jobs);
  });
  return unsubscribe;
}

export function subscribeToOneBooking(bookingId: string, onUpdate: (booking: Booking | null) => void) {
  const bookingRef = firestore().collection('bookings').doc(bookingId);
  const unsubscribe = bookingRef.onSnapshot((docSnap) => {
    if (docSnap.exists()) {
      onUpdate({ id: docSnap.id, ...docSnap.data() } as Booking);
    } else {
      onUpdate(null);
    }
  });
  return unsubscribe;
}

export const fetchBookingsByUser = async (userID: string): Promise<Booking[]> => {
  try {
    const userMyBorrowingsList: Booking[] = [];
    const snapshot = await firestore().collection('bookings').get();
    snapshot.forEach((doc) => {
      const bookingData = doc.data();
      if (bookingData.userId === userID) {
        userMyBorrowingsList.push(mapBorrowingData(doc));
      }
    });
    return userMyBorrowingsList;
  } catch (error) {
    console.error('Error fetching user borrowings: ', error);
    throw error;
  }
};

export const fetchBookingsAsSettler = async (userId: string): Promise<Booking[]> => {
  try {
    const userMyBorrowingsList: Booking[] = [];
    const snapshot = await firestore().collection('bookings').get();
    snapshot.forEach((doc) => {
      const bookingData = doc.data();
      if (bookingData.settlerId === userId) {
        userMyBorrowingsList.push(mapBorrowingData(doc));
      }
    });
    return userMyBorrowingsList;
  } catch (error) {
    console.error('Error fetching user borrowings: ', error);
    throw error;
  }
};

export const fetchSelectedBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingDoc = await firestore().collection('bookings').doc(bookingId).get();
    if (bookingDoc.exists()) {
      return mapBorrowingData(bookingDoc);
    } else {
      console.log('No such selected booking exists.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching selected booking: ', error);
    throw error;
  }
};

export const fetchLendingsByUser = async (userID: string): Promise<Booking[]> => {
  try {
    const userMyLendingsList: Booking[] = [];
    const snapshot = await firestore().collection('borrowings').get();
    snapshot.forEach((doc) => {
      const lendingData = doc.data();
      if (lendingData.product?.ownerID === userID) {
        userMyLendingsList.push(mapBorrowingData(doc));
      }
    });
    return userMyLendingsList;
  } catch (error) {
    console.error('Error fetching user lendings: ', error);
    throw error;
  }
};

export const updateBooking = async (bookingId: string, updatedData: Partial<any>) => {
  try {
    const bookingRef = firestore().collection('bookings').doc(bookingId);
    await bookingRef.update(updatedData);
    console.log('Booking updated with ID: ', bookingId);
  } catch (error) {
    console.error('Error updating booking: ', error);
    throw error;
  }
};

export const countActivitiesByUser = async (userID: string): Promise<{ borrowingReviews: number; lendingReviews: number }> => {
  try {
    const reviewsRef = firestore().collection('borrowings');

    const borrowingSnapshot = await reviewsRef.where('userId', '==', userID).get();
    const borrowingReviews = borrowingSnapshot.size;

    const lendingSnapshot = await reviewsRef.where('product.ownerID', '==', userID).get();
    const lendingReviews = lendingSnapshot.size;

    return { borrowingReviews, lendingReviews };
  } catch (error) {
    console.error('Error counting reviews: ', error);
    throw error;
  }
};

export const deleteProblemReportByIndex = async (bookingId: string, reportIndex: number) => {
  const bookingRef = firestore().collection('bookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) throw new Error('Booking not found');

  const currentReports = bookingSnap.data()?.reports || [];

  if (reportIndex < 0 || reportIndex >= currentReports.length) {
    throw new Error('Invalid report index');
  }

  const updatedReports = currentReports.filter((_: any, idx: number) => idx !== reportIndex);

  await bookingRef.update({
    reports: updatedReports,
  });
};
