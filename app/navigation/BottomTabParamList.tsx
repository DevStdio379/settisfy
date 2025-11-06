import { Booking } from "../services/BookingServices";


export type BottomTabParamList = {

    FavouriteStack: undefined;
    HomeStack: undefined;
    MyBookingsStack: undefined;
    MyBookings: undefined;
    MyBookingDetails: { booking: Booking };
    ChatList: undefined;
    Category: undefined;
    ProfileStack: undefined;

    ProviderDashboard: undefined;
    MyServicesStack: undefined;
    MyRequestsStack: undefined;
    MyRequestDetails: { booking: Booking };
    // ChatList: undefined;
    // Profile: undefined;
};