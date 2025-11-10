import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { formatDistanceToNow } from "date-fns";
import { Address } from "../services/AddressServices";
import { Payment } from "../services/PaymentServices";


interface ActiveJob {
  settlerServiceId: string;
  catalogueId: string;
}

export interface User {
  uid: string;
  email: string;
  userName: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountType: string;
  isVerified: boolean;
  profileImageUrl?: string;
  createAt: any;
  updatedAt: any;
  memberFor: string;
  currentAddress?: Address;
  currentPayment?: Payment;
  activeJobs?: ActiveJob[];
}

export interface UserContextType {
  user: User | null;
  createUser: (userData: User) => Promise<void>;
  fetchCurrentUser: (uid: string) => Promise<void>;
  fetchAllUsers: () => Promise<User[]>;
  updateUserData: (uid: string, updatedData: Partial<User>) => Promise<void>;
  fetchUsersByIds: (userIds: string[]) => Promise<User[]>;
  deleteUserAccount: (userId: string) => Promise<void>;
}

export const defaultUser: User = {
  uid: "default-uid",
  email: "user@example.com",
  userName: "user",
  isActive: false,
  firstName: "UserFirstName",
  lastName: "UserLastName",
  phoneNumber: "1234567890",
  accountType: "customer",
  isVerified: false,
  createAt: "Feb 6, 2025, 12:24:09 PM",
  updatedAt: "Feb 6, 2025, 12:24:09 PM",
  memberFor: "1 year",
};

// Function to upload a single image to Firebase Storage (React Native Firebase version)
export const uploadImage = async (imageName: string, imageUri: string): Promise<string> => {
  try {
    // Generate unique filename and reference
    const filename = `users/${imageName}.jpg`;
    const storageRef = storage().ref(filename);

    // Start upload (React Native Firebase supports local file URIs directly)
    const uploadTask = storageRef.putFile(imageUri);

    // Track upload progress
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (taskSnapshot) => {
          const progress = (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
          console.log(`Upload ${filename}: ${progress.toFixed(2)}% done`);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          console.log('Upload completed');
          resolve();
        }
      );
    });

    // Get download URL after upload completes
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Image uploaded successfully:', downloadURL);

    return downloadURL;

  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};


const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const uid = await AsyncStorage.getItem('userUID');
        if (uid) {
          await fetchCurrentUser(uid);
          await updateUserData(uid, { isActive: true });
        } else {
          console.log("No userUID in storage.");
        }
      } catch (err) {
        console.error("Error restoring user session:", err);
      }
    };

    loadUserFromStorage();
  }, []);

  const [user, setUser] = useState<User | null>(defaultUser);

  const updateUserData = async (uid: string, updatedData: Partial<User>) => {
    try {
      // Handle profile image upload if profileImageUrl (local URI) is provided
      if (updatedData.profileImageUrl && updatedData.profileImageUrl.startsWith('file://')) {
        const localUri = updatedData.profileImageUrl;
        const filename = `users/${uid}.jpg`;
        const storageRef = storage().ref(filename);

        console.log('Uploading new profile image...');
        await storageRef.putFile(localUri);

        // Get the hosted URL
        const downloadURL = await storageRef.getDownloadURL();
        updatedData.profileImageUrl = downloadURL;
        console.log('Profile image uploaded:', downloadURL);
      }

      // Reference to user document
      const userRef = firestore().collection('users').doc(uid);

      // Add a timestamp
      updatedData.updatedAt = firestore.FieldValue.serverTimestamp();

      // Update Firestore document
      await userRef.update(updatedData);
      console.log('User data updated successfully.');

      // Fetch the updated user document
      const updatedDoc = await userRef.get();

      if (updatedDoc.exists()) {
        const userData = updatedDoc.data();

        const updatedUser: User = {
          uid: userData?.uid ?? '',
          email: userData?.email ?? '',
          userName: userData?.userName ?? '',
          isActive: userData?.isActive ?? false,
          firstName: userData?.firstName ?? '',
          lastName: userData?.lastName ?? '',
          phoneNumber: userData?.phoneNumber ?? '',
          accountType: userData?.accountType ?? '',
          isVerified: userData?.isVerified ?? false,
          profileImageUrl: userData?.profileImageUrl ?? '',
          createAt: userData?.createAt ?? '',
          updatedAt: userData?.updatedAt ?? '',
          memberFor: userData?.createdAt
            ? formatDistanceToNow(userData.createdAt.toDate(), { addSuffix: false })
            : '',
          currentAddress: userData?.currentAddress,
          currentPayment: userData?.currentPayment,
          activeJobs: userData?.activeJobs,
        };

        setUser(updatedUser);
        console.log('User updated in context:', updatedUser);
      } else {
        console.warn('No user found with UID:', uid);
      }
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
    }
  };

  const createUser = async (userData: User) => {
    try {
      // Reference to user document
      const userRef = firestore().collection('users').doc(userData.uid);

      // Create document with server timestamp
      await userRef.set({
        ...userData,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update context
      setUser(userData);
      console.log('User created and context updated:', userData);

    } catch (error) {
      console.error('Error creating user in Firestore:', error);
      throw error;
    }
  };

  const fetchCurrentUser = async (uid: string) => {
    try {
      const userRef = firestore().collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const userInfo: User = {
          uid,
          email: userData?.email ?? '',
          userName: userData?.userName ?? '',
          isActive: true,
          firstName: userData?.firstName ?? '',
          lastName: userData?.lastName ?? '',
          phoneNumber: userData?.phoneNumber ?? '',
          accountType: userData?.accountType ?? '', // fixed typo
          isVerified: userData?.isVerified ?? false,
          profileImageUrl: userData?.profileImageUrl ?? '',
          createAt: userData?.createAt ?? '',
          updatedAt: userData?.updatedAt ?? '',
          memberFor: userData?.createdAt
            ? formatDistanceToNow(userData.createdAt.toDate(), { addSuffix: false })
            : '',
          currentAddress: userData?.currentAddress ?? undefined,
          currentPayment: userData?.currentPayment ?? undefined,
          activeJobs: userData?.activeJobs ?? undefined
        };

        setUser(userInfo);
        console.log('✅ User fetched and context updated:', userInfo);
      } else {
        throw new Error('User data not found.');
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      throw error;
    }
  };

  const fetchAllUsers = async (): Promise<User[]> => {
    try {
      const usersCollection = firestore().collection('users');
      const snapshot = await usersCollection.get();

      const usersList: User[] = snapshot.docs.map(doc => {
        const userData = doc.data();

        return {
          uid: userData?.uid ?? '',
          email: userData?.email ?? '',
          userName: userData?.userName ?? '',
          isActive: userData?.isActive ?? false,
          firstName: userData?.firstName ?? '',
          lastName: userData?.lastName ?? '',
          phoneNumber: userData?.phoneNumber ?? '',
          accountType: userData?.accountType ?? '',
          isVerified: userData?.isVerified ?? false,
          profileImageUrl: userData?.profileImageUrl ?? '',
          createAt: userData?.createAt ?? '',
          updatedAt: userData?.updatedAt ?? '',
          memberFor: userData?.createdAt
            ? formatDistanceToNow(userData.createdAt.toDate(), { addSuffix: false })
            : '',
          currentAddress: userData?.currentAddress ?? undefined,
          currentPayment: userData?.currentPayment ?? undefined,
          activeJobs: userData?.activeJobs ?? undefined,
        };
      });

      console.log(`✅ Fetched ${usersList.length} users from Firestore.`);
      return usersList;

    } catch (error) {
      console.error('❌ Error fetching users data:', error);
      throw error;
    }
  };

  const fetchUsersByIds = async (userIds: string[]): Promise<User[]> => {
    try {
      if (!userIds.length) return [];

      // Firestore can query up to 10 IDs at a time
      const chunks = [];
      for (let i = 0; i < userIds.length; i += 10) {
        chunks.push(userIds.slice(i, i + 10));
      }

      const users: User[] = [];

      for (const chunk of chunks) {
        const snapshot = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', chunk)
          .get();

        snapshot.forEach(doc => {
          const userData = doc.data();

          const user: User = {
            uid: doc.id,
            email: userData?.email ?? '',
            userName: userData?.userName ?? '',
            isActive: userData?.isActive ?? false,
            firstName: userData?.firstName ?? '',
            lastName: userData?.lastName ?? '',
            phoneNumber: userData?.phoneNumber ?? '',
            accountType: userData?.accountType ?? '',
            isVerified: userData?.isVerified ?? false,
            profileImageUrl: userData?.profileImageUrl ?? '',
            createAt: userData?.createAt ?? '',
            updatedAt: userData?.updatedAt ?? '',
            memberFor: userData?.createdAt
              ? formatDistanceToNow(userData.createdAt.toDate(), { addSuffix: false })
              : '',
            currentAddress: userData?.currentAddress ?? undefined,
            currentPayment: userData?.currentPayment ?? undefined,
            activeJobs: userData?.activeJobs ?? undefined,
          };

          users.push(user);
        });
      }

      console.log(`✅ Fetched ${users.length} users by IDs.`);
      return users;
    } catch (error) {
      console.error('❌ Error fetching users by IDs:', error);
      throw error;
    }
  };

  // account deletion
  const deleteUserAccount = async (userId: string): Promise<void> => {
    try {
      // Step 1: Delete Firestore user document
      await firestore().collection('users').doc(userId).delete();
      console.log(`Deleted Firestore document for user: ${userId}`);

      // Step 2: Delete user from Firebase Authentication (only if it's the current user)
      const currentUser = auth().currentUser;
      if (currentUser && currentUser.uid === userId) {
        await currentUser.delete();
        console.log(`Deleted Firebase Auth user: ${userId}`);
      } else {
        console.warn(`Cannot delete Auth user ${userId}: not the current user`);
      }

    } catch (error: any) {
      // If "requires recent login" error, handle it
      if (error.code === 'auth/requires-recent-login') {
        console.error("Deletion failed: requires recent login. Prompt user to reauthenticate.");
      } else {
        console.error("Error deleting user account:", error);
      }
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUserData, createUser, fetchCurrentUser, fetchAllUsers, fetchUsersByIds, deleteUserAccount }}>
      {children}
    </UserContext.Provider>
  );
};

// EXPORTED FUNCTION
// Custom hook to use the UserContext

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const fetchSelectedUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (!userData) {
        console.error("⚠️ No data found for user:", userId);
        return null;
      }

      const userInfo: User = {
        uid: userData.uid ?? '',
        email: userData.email ?? '',
        userName: userData.userName ?? '',
        isActive: userData.isActive ?? true,
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        phoneNumber: userData.phoneNumber ?? '',
        accountType: userData.accountType ?? '',
        isVerified: userData.isVerified ?? false,
        profileImageUrl: userData.profileImageUrl ?? '',
        createAt: userData.createAt ?? '',
        updatedAt: userData.updatedAt ?? '',
        memberFor: userData.createdAt
          ? formatDistanceToNow(userData.createdAt.toDate(), { addSuffix: false })
          : '',
        currentAddress: userData.currentAddress ?? undefined,
        currentPayment: userData.currentPayment ?? undefined,
        activeJobs: userData.activeJobs ?? undefined,
      };

      console.log('✅ User fetched successfully:', userInfo.uid);
      return userInfo;
    } else {
      console.warn('⚠️ User not found:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    throw error;
  }
};
