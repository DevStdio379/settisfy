export type BookingStatus =
    | 0.1
    | 0
    | 0.2
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 8.1
    | 8.2
    | 9
    | 9.1
    | 9.2
    | 10
    | 11
    | 12
    | number

export function getStatusBadgeClass(status: BookingStatus): string {
    switch (status) {
        case 0.1:
            return 'bg-warning'
        case 0:
            return 'bg-secondary'
        case 0.2:
            return 'bg-warning'
        case 1:
            return 'bg-secondary'
        case 2:
            return 'bg-secondary'
        case 3:
            return 'bg-secondary'
        case 4:
            return 'bg-secondary'
        case 5:
            return 'bg-secondary'
        case 6:
            return 'bg-success'
        case 7:
            return 'bg-secondary'
        case 8:
            return 'bg-danger'
        case 8.1:
            return 'bg-danger'
        case 8.2:
            return 'bg-secondary'
        case 9:
            return 'bg-danger'
        case 9.1:
            return 'bg-danger'
        case 9.2:
            return 'bg-secondary'
        case 10:
            return 'bg-success'
        case 11:
            return 'bg-secondary'
        case 12:
            return 'bg-danger'
        default:
            return 'bg-light text-dark'
    }
}

export function getStatusLabel(status: BookingStatus): string {
    switch (status) {
        case 0.1:
            return 'Verify Booking'
        case 0:
            return 'Broadcasting'
        case 0.2:
            return 'Settler Accepted'
        case 1:
            return 'Settler Assigned'
        case 2:
            return 'In Progress'
        case 3:
            return 'In Progress'
        case 4:
            return 'Finished Service'
        case 5:
            return 'Warranty Period'
        case 6:
            return 'Service Completed'
        case 7:
            return 'Quote Updated'
        case 8:
            return 'Incompletion Reported'
        case 8.1:
            return 'Incompletion Report Rejected'
        case 8.2:
            return 'Resolving Incompletion Report'
        case 9:
            return 'Warranty Period Issue Reported'
        case 9.1:
            return 'Warranty Period Issue Rejected'
        case 9.2:
            return 'Warranty Period Issue Resolved'
        case 10:
            return 'Review Submitted'
        case 11:
            return 'Payment Released'
        case 12:
            return 'Booking Cancelled'
        default:
            return 'Unknown'
    }
}
