import { getDocs } from "@react-native-firebase/firestore";
import { firebase } from "@react-native-firebase/messaging";

export interface SystemParameter {
    platformFee: number;
    platformFeeIsActive: boolean;
    showAdminApproveBookingButton: boolean;
    showAssignSettlerButton: boolean;
    faqLink: string;
    customerSupportLink: string;
}

export const fetchSystemParameters = async (): Promise<SystemParameter> => {
    const systemParamsRef = await firebase.firestore().collection('system_parameters');
    const snapshot = await getDocs(systemParamsRef);
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
        platformFee: data.platformFee,
        platformFeeIsActive: data.platformFeeIsActive,
        showAdminApproveBookingButton: data.showAdminApproveBookingButton,
        showAssignSettlerButton: data.showAssignSettlerButton,
        faqLink: data.faqLink,
        customerSupportLink: data.customerSupportLink,
    };
};
