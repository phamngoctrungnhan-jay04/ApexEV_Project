import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  vi: {
    translation: {
      // Common
      common: {
        welcome: 'Chào mừng',
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        register: 'Đăng ký',
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Sửa',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        export: 'Xuất',
        import: 'Nhập',
        dashboard: 'Trang chủ',
        profile: 'Hồ sơ',
        settings: 'Cài đặt',
        loading: 'Đang tải...',
        noData: 'Không có dữ liệu',
        viewAll: 'Xem tất cả'
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Chào mừng',
        greeting: 'Chúc bạn có một ngày tuyệt vời! Hãy theo dõi tình trạng xe của bạn.',
        totalMaintenance: 'Tổng lượt bảo dưỡng',
        upcomingBookings: 'Lịch hẹn sắp tới',
        totalSpent: 'Tổng chi phí',
        quickActions: 'Thao tác nhanh',
        bookMaintenance: 'Đặt lịch bảo dưỡng',
        chatWithTechnician: 'Chat với kỹ thuật viên',
        viewHistory: 'Xem lịch sử',
        manageVehicle: 'Quản lý xe',
        activeWork: 'Công việc đang thực hiện',
        upcomingBookingsTitle: 'Lịch hẹn sắp tới',
        costChart: 'Chi phí bảo dưỡng 6 tháng gần đây',
        notifications: 'Thông báo gần đây',
        noBookings: 'Chưa có lịch hẹn nào',
        bookNow: 'Đặt lịch ngay',
        service: 'Dịch vụ',
        vehicle: 'Xe',
        technician: 'Kỹ thuật viên',
        estimatedCompletion: 'Dự kiến hoàn thành',
        thisMonth: 'tháng này',
        thisWeek: 'Tuần này',
        lastSixMonths: '6 tháng',
        viewAllNotifications: 'Xem tất cả thông báo'
      },
      
      // Auth Pages
      auth: {
        loginTitle: 'Đăng nhập ',
        loginSubtitle: 'Chào mừng bạn trở lại! Vui lòng đăng nhập để tiếp tục.',
        email: 'Email',
        emailPlaceholder: 'your.email@example.com',
        password: 'Mật khẩu',
        passwordPlaceholder: 'Nhập mật khẩu của bạn',
        rememberMe: 'Ghi nhớ đăng nhập',
        forgotPassword: 'Quên mật khẩu?',
        loginButton: 'Đăng nhập',
        orLoginWith: 'Hoặc đăng nhập với',
        noAccount: 'Chưa có tài khoản?',
        signUpNow: 'Đăng ký ngay',
        registerTitle: 'Tạo tài khoản mới',
        registerSubtitle: 'Đăng ký để trải nghiệm dịch vụ bảo dưỡng xe điện tốt nhất',
        fullName: 'Họ và tên',
        fullNamePlaceholder: 'Nguyễn Văn A',
        phone: 'Số điện thoại',
        phonePlaceholder: '0912345678',
        confirmPassword: 'Xác nhận mật khẩu',
        confirmPasswordPlaceholder: 'Nhập lại mật khẩu',
        vehicleInfo: 'Thông tin xe (không bắt buộc)',
        vehicleBrand: 'Hãng xe',
        vehicleBrandPlaceholder: 'VinFast',
        vehicleModel: 'Dòng xe',
        vehicleModelPlaceholder: 'VF8',
        licensePlate: 'Biển số xe',
        licensePlatePlaceholder: '29A-12345',
        agreeTerms: 'Tôi đồng ý với',
        termsOfService: 'Điều khoản dịch vụ',
        and: 'và',
        privacyPolicy: 'Chính sách bảo mật',
        registerButton: 'Đăng ký',
        orRegisterWith: 'Hoặc đăng ký với',
        haveAccount: 'Đã có tài khoản?',
        loginNow: 'Đăng nhập ngay',
        verifyEmail: 'Xác thực Email',
        verifyEmailMessage: 'Chúng tôi đã gửi mã xác thực đến email',
        enterVerificationCode: 'Vui lòng nhập mã xác thực 6 chữ số',
        resendCode: 'Gửi lại mã',
        verifyButton: 'Xác thực',
        passwordStrength: 'Độ mạnh mật khẩu'
      },
      
      // Customer
      customer: {
        dashboard: 'Trang chủ khách hàng',
        booking: 'Đặt lịch bảo dưỡng',
        history: 'Lịch sử bảo dưỡng',
        invoices: 'Hóa đơn',
        chat: 'Chat hỗ trợ',
        ratings: 'Đánh giá'
      },
      
      // Menu Items
      menu: {
        dashboard: 'Trang chủ',
        booking: 'Đặt lịch',
        history: 'Lịch sử',
        invoices: 'Hóa đơn',
        chat: 'Chat',
        ratings: 'Đánh giá',
        profile: 'Hồ sơ',
        settings: 'Cài đặt'
      },
      
      // Status
      status: {
        pending: 'Chờ xử lý',
        inProgress: 'Đang thực hiện',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        confirmed: 'Đã xác nhận'
      },
      
      // Booking
      booking: {
        title: 'Đặt lịch bảo dưỡng',
        subtitle: 'Chọn dịch vụ và thời gian phù hợp với bạn',
        selectService: 'Chọn dịch vụ',
        selectDateTime: 'Chọn ngày giờ',
        vehicleInfo: 'Thông tin xe',
        confirmation: 'Xác nhận',
        continue: 'Tiếp tục',
        back: 'Quay lại',
        confirmBooking: 'Xác nhận đặt lịch',
        servicesSelected: 'Dịch vụ đã chọn',
        selectDate: 'Chọn ngày',
        selectTime: 'Chọn giờ',
        selectVehicle: 'Chọn xe',
        notes: 'Ghi chú',
        notesPlaceholder: 'Nhập ghi chú hoặc yêu cầu đặc biệt...',
        totalCost: 'Tổng chi phí',
        totalDuration: 'Tổng thời gian',
        estimatedCost: 'Chi phí dự kiến',
        summary: 'Tóm tắt đặt lịch'
      },

      // Invoices
      invoices: {
        title: 'Hóa đơn của tôi',
        subtitle: 'Quản lý và theo dõi các hóa đơn bảo dưỡng',
        invoiceNumber: 'Số hóa đơn',
        date: 'Ngày',
        amount: 'Số tiền',
        paymentMethod: 'Phương thức',
        status: 'Trạng thái',
        actions: 'Thao tác',
        paid: 'Đã thanh toán',
        unpaid: 'Chưa thanh toán',
        pending: 'Đang chờ',
        allStatus: 'Tất cả trạng thái',
        searchPlaceholder: 'Tìm theo số hóa đơn...',
        view: 'Xem',
        download: 'Tải về',
        downloading: 'Đang tải',
        noInvoices: 'Không có hóa đơn nào',
        first: 'Đầu',
        previous: 'Trước',
        next: 'Sau',
        last: 'Cuối',
        invoiceDetails: 'Chi tiết hóa đơn',
        issueDate: 'Ngày phát hành',
        dueDate: 'Ngày đến hạn',
        paymentDate: 'Ngày thanh toán',
        itemDetails: 'Chi tiết dịch vụ',
        description: 'Mô tả',
        subtotal: 'Tạm tính',
        tax: 'Thuế',
        discount: 'Giảm giá',
        total: 'Tổng cộng',
        notes: 'Ghi chú',
        close: 'Đóng',
        cash: 'Tiền mặt',
        card: 'Thẻ',
        transfer: 'Chuyển khoản',
        loyaltyDiscount: 'Giảm giá khách hàng thân thiết',
        promotionDiscount: 'Giảm giá khuyến mãi',
        totalAmount: 'Tổng giá trị'
      }
    }
  },
  en: {
    translation: {
      // Common
      common: {
        welcome: 'Welcome',
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        dashboard: 'Dashboard',
        profile: 'Profile',
        settings: 'Settings',
        loading: 'Loading...',
        noData: 'No data available',
        viewAll: 'View all'
      },
      
      // Dashboard
      dashboard: {
        welcome: 'Welcome',
        greeting: 'Have a great day! Track your vehicle status.',
        totalMaintenance: 'Total Maintenance',
        upcomingBookings: 'Upcoming Bookings',
        totalSpent: 'Total Spent',
        quickActions: 'Quick Actions',
        bookMaintenance: 'Book Maintenance',
        chatWithTechnician: 'Chat with Technician',
        viewHistory: 'View History',
        manageVehicle: 'Manage Vehicle',
        activeWork: 'Work in Progress',
        upcomingBookingsTitle: 'Upcoming Bookings',
        costChart: 'Maintenance Cost (Last 6 Months)',
        notifications: 'Recent Notifications',
        noBookings: 'No bookings yet',
        bookNow: 'Book Now',
        service: 'Service',
        vehicle: 'Vehicle',
        technician: 'Technician',
        estimatedCompletion: 'Estimated Completion',
        thisMonth: 'this month',
        thisWeek: 'This week',
        lastSixMonths: '6 months',
        viewAllNotifications: 'View all notifications'
      },
      
      // Auth Pages
      auth: {
        loginTitle: 'Login',
        loginSubtitle: 'Welcome back! Please login to continue.',
        email: 'Email',
        emailPlaceholder: 'your.email@example.com',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        loginButton: 'Login',
        orLoginWith: 'Or login with',
        noAccount: "Don't have an account?",
        signUpNow: 'Sign up now',
        registerTitle: 'Create New Account',
        registerSubtitle: 'Register to experience the best EV maintenance service',
        fullName: 'Full Name',
        fullNamePlaceholder: 'John Doe',
        phone: 'Phone Number',
        phonePlaceholder: '0912345678',
        confirmPassword: 'Confirm Password',
        confirmPasswordPlaceholder: 'Re-enter password',
        vehicleInfo: 'Vehicle Information (Optional)',
        vehicleBrand: 'Vehicle Brand',
        vehicleBrandPlaceholder: 'VinFast',
        vehicleModel: 'Vehicle Model',
        vehicleModelPlaceholder: 'VF8',
        licensePlate: 'License Plate',
        licensePlatePlaceholder: '29A-12345',
        agreeTerms: 'I agree to the',
        termsOfService: 'Terms of Service',
        and: 'and',
        privacyPolicy: 'Privacy Policy',
        registerButton: 'Register',
        orRegisterWith: 'Or register with',
        haveAccount: 'Already have an account?',
        loginNow: 'Login now',
        verifyEmail: 'Verify Email',
        verifyEmailMessage: 'We sent a verification code to',
        enterVerificationCode: 'Please enter the 6-digit verification code',
        resendCode: 'Resend code',
        verifyButton: 'Verify',
        passwordStrength: 'Password Strength'
      },
      
      // Customer
      customer: {
        dashboard: 'Customer Dashboard',
        booking: 'Book Maintenance',
        history: 'Maintenance History',
        invoices: 'Invoices',
        chat: 'Chat Support',
        ratings: 'Ratings'
      },
      
      // Menu Items
      menu: {
        dashboard: 'Dashboard',
        booking: 'Booking',
        history: 'History',
        invoices: 'Invoices',
        chat: 'Chat',
        ratings: 'Ratings',
        profile: 'Profile',
        settings: 'Settings'
      },
      
      // Status
      status: {
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        confirmed: 'Confirmed'
      },
      
      // Booking
      booking: {
        title: 'Book Maintenance',
        subtitle: 'Select services and time that suits you',
        selectService: 'Select Service',
        selectDateTime: 'Select Date & Time',
        vehicleInfo: 'Vehicle Info',
        confirmation: 'Confirmation',
        continue: 'Continue',
        back: 'Back',
        confirmBooking: 'Confirm Booking',
        servicesSelected: 'Services Selected',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        selectVehicle: 'Select Vehicle',
        notes: 'Notes',
        notesPlaceholder: 'Enter notes or special requests...',
        totalCost: 'Total Cost',
        totalDuration: 'Total Duration',
        estimatedCost: 'Estimated Cost',
        summary: 'Booking Summary'
      },

      // Invoices
      invoices: {
        title: 'My Invoices',
        subtitle: 'Manage and track your maintenance invoices',
        invoiceNumber: 'Invoice Number',
        date: 'Date',
        amount: 'Amount',
        paymentMethod: 'Payment Method',
        status: 'Status',
        actions: 'Actions',
        paid: 'Paid',
        unpaid: 'Unpaid',
        pending: 'Pending',
        allStatus: 'All Statuses',
        searchPlaceholder: 'Search by invoice number...',
        view: 'View',
        download: 'Download',
        downloading: 'Downloading',
        noInvoices: 'No invoices found',
        first: 'First',
        previous: 'Previous',
        next: 'Next',
        last: 'Last',
        invoiceDetails: 'Invoice Details',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        paymentDate: 'Payment Date',
        itemDetails: 'Service Details',
        description: 'Description',
        subtotal: 'Subtotal',
        tax: 'Tax',
        discount: 'Discount',
        total: 'Total',
        notes: 'Notes',
        close: 'Close',
        cash: 'Cash',
        card: 'Card',
        transfer: 'Bank Transfer',
        loyaltyDiscount: 'Loyalty Discount',
        promotionDiscount: 'Promotion Discount',
        totalAmount: 'Total Amount'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // Default language
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
