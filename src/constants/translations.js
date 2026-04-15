export const translations = {
  en: {
    // Navbar
    nav_links: {
      pets: "Pets",
      supplies: "Supplies",
      clinics: "Clinics",
      hostels: "Hostels",
      post_ad: "Post Ad"
    },
    nav_search: "Search pets, supplies...",
    
    // Profile Tabs
    profile_tabs: {
      my_ads: "My Ads",
      messages: "Messages",
      settings: "Settings",
      sign_out: "Sign Out"
    },
    
    // Settings
    settings: {
      title: "Account Settings",
      display_name: "Display Name",
      email: "Email Address",
      email_note: "Email cannot be changed for security reasons.",
      save_btn: "Save Changes",
      saving: "Saving...",
      security: "Security",
      security_note: "Changing your password regularly improves account safety.",
      pass_reset_btn: "Send Password Reset Link",
      pref_title: "Preferences",
      lang_label: "Display Language",
      lang_en: "English",
      lang_ar: "العربية"
    },
    
    // General
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      back: "Back",
      details: "Details",
      message: "Message",
      free: "Free",
      verified: "Verified",
      safe: "Safe Stay",
      premium: "Premium"
    },

    // Pets Page
    pets_page: {
      title: "Explore Pets",
      desc: "Find your new companion from thousands of rescues.",
      search_placeholder: "Search pets, breeds, city...",
      no_pets: "No pets found",
      no_pets_desc: "Try adjusting your search criteria!",
      loading_pets: "Loading pets..."
    },
    
    // Home Page
    home: {
      hero_title: "Find your new",
      hero_highlight: "best friend",
      hero_desc: "PetZone connects you with adoptable pets, top-tier clinics, and the best supplies in your area. Every pet deserves a loving home.",
      btn_explore: "Explore Pets",
      btn_list: "List a Pet",
      features: [
        { title: "Adoptions", desc: "Browse hundreds of vetted pets waiting for a home." },
        { title: "Verified Clinics", desc: "Connect with certified veterinarians." },
        { title: "Lost & Found", desc: "Report missing pets or help others find theirs." }
      ]
    },

    // Category Names
    categories: {
      all: "All",
      dog: "Dog",
      cat: "Cat",
      bird: "Bird",
      fish: "Fish",
      rabbit: "Rabbit",
      rodent: "Rodent",
      reptile: "Reptile",
      livestock: "Livestock",
      accessories: "Accessories",
      housing: "Housing & Carriers",
      comfort: "Comfort & Bedding",
      toys: "Toys",
      hygiene: "Hygiene & Grooming",
      food: "Food & Feeding",
      bird_eq: "Bird Equipment",
      aquarium: "Aquarium Decor",
      other: "Other"
    },

    // Detail Pages
    details: {
      back_hostels: "Back to Hostels",
      back_clinics: "Back to Clinics",
      back_supplies: "Back to Supplies",
      back_pets: "Back to Pets",
      overnight: "Overnight Stay",
      services: "Included Services",
      treatments: "Available Treatments",
      expertise: "Expertise & Notes",
      contact_reception: "Contact Reception",
      rating: "Rating",
      description: "Description",
      item_desc: "Item Description",
      about: "About",
      features: "Key Features",
      traits: "Traits & Health",
      contact_hostel: "Contact Hostel",
      contact_clinic: "Contact Clinic",
      contact_seller: "Contact Seller",
      contact_owner: "Contact Owner",
      msg_seller: "Message Seller",
      msg_owner: "Message Owner",
      no_desc: "No description provided.",
      std_services: "Standard services included.",
      std_clinic: "Professional veterinary services provided.",
      std_supply: "Quality pet supplies for your companion.",
      std_traits: "All standard healthy traits.",
      price_night: "night",
      free: "Free",
      no_image: "No Image Provided",
      login_contact: "You must be logged in to view contact details.",
      btn_login: "Login to Contact"
    },
    
    // Forms
    forms: {
      post_ad_title: "Post a New Listing",
      publish: "Publish Listing",
      posting: "Posting...",
      success_pet: "Pet listed successfully!",
      success_supply: "Supply listed successfully!",
      success_clinic: "Clinic listed successfully!",
      success_hostel: "Hostel listed successfully!",
      error_submit: "Failed to submit listing",
      error_image: "Please upload a cover image!",
      
      pet: {
        title: "List a Pet",
        name: "Name",
        type: "Animal Type",
        breed: "Breed",
        gender: "Gender",
        age: "Age Bracket",
        price: "Price ($)",
        price_placeholder: "0 for adoption",
        location: "Location",
        location_placeholder: "City, State",
        features: "Pet Features & Traits",
        media: "Media Assets",
        cover: "1. Card Cover Image (Required)",
        cover_desc: "This image appears on the main marketplace cards.",
        gallery: "2. Detailed Gallery (Max 5)",
        gallery_desc: "Add more angles! These will appear in the photo slider.",
        desc: "Description",
        desc_placeholder: "Tell us about the pet...",
        genders: { male: "Male", female: "Female" },
        ages: ["0-6 months", "6-12 months", "1-3 years", "3+ years"],
        traits: {
          vaccinated: "Vaccinated",
          trained: "House Trained",
          microchipped: "Microchipped",
          friendly: "Friendly with Kids",
          neutered: "Neutered"
        }
      },
      supply: {
        title: "Sell Supplies",
        name: "Item Title",
        name_placeholder: "e.g. Ergonomic Dog House",
        condition: "Item Condition",
        cond_new: "New",
        cond_used: "Used",
        category: "Category",
        specific: "Specific Item",
        price: "Price ($)",
        media: "Product Media Assets",
        cover: "1. Card Cover Image (Required)",
        cover_desc: "The main product photo for the marketplace.",
        gallery: "2. Detailed Views (Max 5)",
        gallery_desc: "Add more angles of your item!",
        features: "Item Features",
        desc: "Description",
        desc_placeholder: "Tell us more about the item...",
        feats: {
          warranty: "Warranty",
          delivery: "Quick Delivery",
          packaging: "Original Packaging",
          safe: "Safe for Pets",
          quality: "High Quality"
        }
      },
      clinic: {
        title: "Add a Clinic",
        name: "Clinic Name",
        location: "Location",
        services: "Clinic Services",
        desc: "Description",
        desc_placeholder: "Tell us more about your clinic...",
        media: "Clinic Media",
        cover: "1. Card Cover Image (Required)",
        cover_desc: "Main image for the clinic list.",
        gallery: "2. Detailed Gallery (Max 5)",
        gallery_desc: "Display your facilities and equipment.",
        srvs: {
          emergency: "Emergency 24/7",
          surgery: "Surgery",
          pharmacy: "Pharmacy",
          lab: "Laboratory",
          vax: "Vaccination",
          xray: "X-Ray"
        }
      },
      hostel: {
        title: "List a Pet Hostel",
        name: "Hostel Name",
        location: "Location",
        price: "Price per Night ($)",
        features: "Hostel Features & Services",
        desc: "Description",
        desc_placeholder: "Tell us more about your hostel...",
        media: "Hostel Media Assets",
        cover: "1. Card Cover Image (Required)",
        cover_desc: "The main profile photo for your hostel.",
        gallery: "2. Service Gallery (Max 5)",
        gallery_desc: "Show the rooms, play areas, and happy guests!",
        srvs: {
          wifi: "WiFi",
          ac: "AC",
          security: "24/7 Security",
          medical: "Medical Support",
          outdoor: "Outdoor Area",
          grooming: "Grooming"
        }
      }
    },

    // Chat
    chat: {
      title: "Conversations",
      no_messages: "No messages yet",
      start: "Start a conversation",
      type_placeholder: "Type your message...",
      confirm_delete_msg: "Remove this message for everyone?",
      confirm_delete_chat: "Delete this entire conversation? This cannot be undone.",
      new_tag: "New"
    },

    // Profile
    profile: {
      hi: "Hi",
      no_ads: "You haven't posted any listings yet.",
      delete_ad_confirm: "Are you sure you want to delete this listing?",
      edit_ad: "Edit Ad",
      delete_ad: "Delete Ad"
    },

    // Favorites
    favorites: {
      title: "My Wishlist",
      desc: "Items and pets you've saved for later.",
      empty: "Your wishlist is empty",
      empty_desc: "Explore our marketplace and tap the heart icon to save your favorite listings here!",
      btn_explore: "Start Exploring",
      loading: "Loading your favorites..."
    },

    // Data Mappings
    breeds: {
      "German Shepherd": "German Shepherd",
      "Husky": "Husky",
      "Labrador Retriever": "Labrador Retriever",
      "Golden Retriever": "Golden Retriever",
      "Pomeranian": "Pomeranian",
      "Rottweiler": "Rottweiler",
      "Chihuahua": "Chihuahua",
      "Pitbull": "Pitbull",
      "Doberman": "Doberman",
      "Shih Tzu": "Shih Tzu",
      "Maltese": "Maltese",
      "Samoyed": "Samoyed",
      "Akita": "Akita",
      "Persian": "Persian",
      "Siamese": "Siamese",
      "Scottish Fold": "Scottish Fold",
      "British Shorthair": "British Shorthair",
      "Turkish Angora": "Turkish Angora",
      "Maine Coon": "Maine Coon",
      "Bengal": "Bengal",
      "Sphynx": "Sphynx",
      "Ragdoll": "Ragdoll",
      "Russian Blue": "Russian Blue",
      "Budgie": "Budgie",
      "Cockatiel": "Cockatiel",
      "Lovebird": "Lovebird",
      "Canary": "Canary",
      "Parrot": "Parrot",
      "Goldfish": "Goldfish",
      "Turtle": "Turtle",
      "Horse": "Horse",
      "Mixed / Other": "Mixed / Other",
      "Other": "Other"
    },
    items: {
      "Dog House": "Dog House",
      "Cat House": "Cat House",
      "Cages": "Cages",
      "Carrier": "Carrier",
      "Pet Bed": "Pet Bed",
      "Collar": "Collar",
      "Leash": "Leash",
      "Toys": "Toys",
      "Food": "Food",
      "Shampoo": "Shampoo"
    }
  },
  ar: {
    // Navbar
    nav_links: {
      pets: "حيوانات",
      supplies: "مستلزمات",
      clinics: "عيادات",
      hostels: "فنادق",
      post_ad: "أضف إعلان"
    },
    nav_search: "ابحث عن حيوانات، مستلزمات...",
    
    // Profile Tabs
    profile_tabs: {
      my_ads: "إعلاناتي",
      messages: "الرسائل",
      settings: "الإعدادات",
      sign_out: "تسجيل الخروج"
    },
    
    // Settings
    settings: {
      title: "إعدادات الحساب",
      display_name: "اسم العرض",
      email: "البريد الإلكتروني",
      email_note: "لا يمكن تغيير البريد الإلكتروني لأسباب أمنية.",
      save_btn: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      security: "الأمان",
      security_note: "تغيير كلمة المرور بانتظام يعزز أمان حسابك.",
      pass_reset_btn: "إرسال رابط إعادة تعيين كلمة المرور",
      pref_title: "التفضيلات",
      lang_label: "لغة العرض",
      lang_en: "English",
      lang_ar: "العربية"
    },
    
    // General
    common: {
      loading: "جاري التحميل...",
      error: "حدث خطأ ما",
      back: "رجوع",
      details: "التفاصيل",
      message: "تواصل",
      free: "مجاناً",
      verified: "موثق",
      safe: "إقامة آمنة",
      premium: "مميز"
    },

    // Pets Page
    pets_page: {
      title: "استكشف الحيوانات",
      desc: "ابحث عن صديقك الجديد من بين آلاف الحيوانات.",
      search_placeholder: "ابحث عن سلالة، مدينة...",
      no_pets: "لم يتم العثور على حيوانات",
      no_pets_desc: "حاول تغيير معايير البحث الخاصة بك!",
      loading_pets: "جاري تحميل الحيوانات..."
    },
    
    // Home Page
    home: {
      hero_title: "ابحث عن",
      hero_highlight: "صديقك المقرب",
      hero_desc: "يربطك PetZone بالحيوانات الأليفة القابلة للتبني، وأفضل العيادات والمستلزمات في منطقتك. كل حيوان يستحق منزلاً محباً.",
      btn_explore: "استكشف الحيوانات",
      btn_list: "أضف حيواناً",
      features: [
        { title: "التبني", desc: "تصفح مئات الحيوانات التي تنتظر منزلاً جديداً." },
        { title: "عيادات معتمدة", desc: "تواصل مع أفضل الأطباء البيطريين المعتمدين." },
        { title: "مفقود وموجود", desc: "أبلغ عن الحيوانات المفقودة أو ساعد الآخرين في العثور على أليفهم." }
      ]
    },

    // Category Names
    categories: {
      all: "الكل",
      dog: "كلاب",
      cat: "قطط",
      bird: "طيور",
      fish: "أسماك",
      rabbit: "أرانب",
      rodent: "قوارض",
      reptile: "زواحف",
      livestock: "مواشي",
      accessories: "إكسسوارات",
      housing: "بيوت وأماكن سكن",
      comfort: "أشياء الراحة",
      toys: "ألعاب",
      hygiene: "العناية والنظافة",
      food: "أدوات الطعام",
      bird_eq: "مستلزمات طيور",
      aquarium: "ديكور أحواض",
      other: "أخرى"
    },

    // Detail Pages
    details: {
      back_hostels: "العودة للفنادق",
      back_clinics: "العودة للعيادات",
      back_supplies: "العودة للمستلزمات",
      back_pets: "العودة للحيوانات",
      overnight: "إقامة ليلة كاملة",
      services: "الخدمات المشمولة",
      treatments: "العلاجات المتوفرة",
      expertise: "الخبرات والملاحظات",
      contact_reception: "تواصل مع الاستقبال",
      rating: "التقييم",
      description: "الوصف",
      item_desc: "عن المنتج",
      about: "حول الحيوان",
      features: "الميزات الأساسية",
      traits: "الصفات والصحة",
      contact_hostel: "تواصل مع الفندق",
      contact_clinic: "تواصل مع العيادة",
      contact_seller: "تواصل مع البائع",
      contact_owner: "تواصل مع المالك",
      msg_seller: "مراسلة البائع",
      msg_owner: "مراسلة المالك",
      no_desc: "لا يوجد وصف متوفر.",
      std_services: "الخدمات الأساسية مشمولة.",
      std_clinic: "خدمات بيطرية احترافية مقدمة.",
      std_supply: "مستلزمات عالية الجودة لأليفك.",
      std_traits: "كل الصفات الصحية الأساسية.",
      price_night: "ليلة",
      free: "مجاناً",
      no_image: "لا توجد صورة متوفرة",
      login_contact: "يجب تسجيل الدخول لرؤية تفاصيل التواصل.",
      btn_login: "سجل دخول للتواصل"
    },

    // Forms
    forms: {
      post_ad_title: "إضافة إعلان جديد",
      publish: "نشر الإعلان",
      posting: "جاري النشر...",
      success_pet: "تم إضافة الحيوان بنجاح!",
      success_supply: "تم إضافة المستلزمات بنجاح!",
      success_clinic: "تم إضافة العيادة بنجاح!",
      success_hostel: "تم إضافة الفندق بنجاح!",
      error_submit: "فشل في إرسال الإعلان",
      error_image: "يرجى رفع صورة الغلاف!",
      
      pet: {
        title: "إضافة حيوان",
        name: "الاسم",
        type: "نوع الحيوان",
        breed: "السلالة",
        gender: "الجنس",
        age: "الفئة العمرية",
        price: "السعر ($)",
        price_placeholder: "0 للتبني",
        location: "الموقع",
        location_placeholder: "المدينة، المنطقة",
        features: "ميزات وصفات الأليف",
        media: "وسائط الميديا",
        cover: "1. صورة الغلاف (مطلوبة)",
        cover_desc: "تظهر هذه الصورة في الكروت الرئيسية للمتجر.",
        gallery: "2. المعرض التفصيلي (بحد أقصى 5)",
        gallery_desc: "أضف المزيد من الزوايا! ستظهر في سلايدر الصور.",
        desc: "الوصف",
        desc_placeholder: "أخبرنا عن الأليف...",
        genders: { male: "ذكر", female: "أنثى" },
        ages: ["0-6 أشهر", "6-12 شهر", "1-3 سنوات", "3+ سنوات"],
        traits: {
          vaccinated: "مطعم",
          trained: "مدرب منزلياً",
          microchipped: "مزود بشريحة",
          friendly: "ودود مع الأطفال",
          neutered: "معقم"
        }
      },
      supply: {
        title: "بيع مستلزمات",
        name: "عنوان المنتج",
        name_placeholder: "مثال: بيت كلب مريح",
        condition: "حالة المنتج",
        cond_new: "جديد",
        cond_used: "مستعمل",
        category: "الفئة",
        specific: "الصنف المحدد",
        price: "السعر ($)",
        media: "وسائط المنتج",
        cover: "1. صورة الغلاف (مطلوبة)",
        cover_desc: "الصورة الرئيسية للمتجر.",
        gallery: "2. صور تفصيلية (بحد أقصى 5)",
        gallery_desc: "أضف المزيد من الزوايا لمنتجك!",
        features: "ميزات المنتج",
        desc: "الوصف",
        desc_placeholder: "أخبرنا المزيد عن المنتج...",
        feats: {
          warranty: "كفالة",
          delivery: "توصيل سريع",
          packaging: "تغليف أصلي",
          safe: "آمن للحيوانات",
          quality: "جودة عالية"
        }
      },
      clinic: {
        title: "إضافة عيادة",
        name: "اسم العيادة",
        location: "الموقع",
        services: "خدمات العيادة",
        desc: "الوصف",
        desc_placeholder: "أخبرنا المزيد عن عيادتك...",
        media: "وسائط العيادة",
        cover: "1. صورة الغلاف (مطلوبة)",
        cover_desc: "الصورة الرئيسية في قائمة العيادات.",
        gallery: "2. المعرض التفصيلي (بحد أقصى 5)",
        gallery_desc: "اعرض مرافقك ومعداتك.",
        srvs: {
          emergency: "طوارئ 24/7",
          surgery: "جراحة",
          pharmacy: "صيدلية",
          lab: "مختبر",
          vax: "تطعيمات",
          xray: "أشعة X-Ray"
        }
      },
      hostel: {
        title: "إضافة فندق للحيوانات",
        name: "اسم الفندق",
        location: "الموقع",
        price: "السعر لليلة ($)",
        features: "ميزات وخدمات الفندق",
        desc: "الوصف",
        desc_placeholder: "أخبرنا المزيد عن فندقك...",
        media: "وسائط الفندق",
        cover: "1. صورة الغلاف (مطلوبة)",
        cover_desc: "الصورة الشخصية الرئيسية لفندقك.",
        gallery: "2. معرض الخدمات (بحد أقصى 5)",
        gallery_desc: "اعرض الغرف، أماكن اللعب، والضيوف السعداء!",
        srvs: {
          wifi: "واي فاي",
          ac: "تكييف",
          security: "أمن 24/7",
          medical: "دعم طبي",
          outdoor: "منطقة خارجية",
          grooming: "حلاقة وتجميل"
        }
      }
    },

    // Chat
    chat: {
      title: "المحادثات",
      no_messages: "لا توجد رسائل بعد",
      start: "ابدأ محادثة",
      type_placeholder: "اكتب رسالتك...",
      confirm_delete_msg: "حذف هذه الرسالة للجميع؟",
      confirm_delete_chat: "حذف هذه المحادثة بالكامل؟ لا يمكن التراجع عن هذا الفعل.",
      new_tag: "جديد"
    },

    // Profile
    profile: {
      hi: "مرحباً",
      no_ads: "لم تقم بنشر أي إعلانات بعد.",
      delete_ad_confirm: "هل أنت متأكد أنك تريد حذف هذا الإعلان؟",
      edit_ad: "تعديل الإعلان",
      delete_ad: "حذف الإعلان"
    },

    // Favorites
    favorites: {
      title: "قائمة المفضلة",
      desc: "الأدوات والحيوانات التي قمت بحفظها للعودة إليها لاحقاً.",
      empty: "قائمة المفضلة فارغة",
      empty_desc: "استكشف متجرنا واضغط على أيقونة القلب لحفظ إعلاناتك المفضلة هنا!",
      btn_explore: "ابدأ الاستكشاف",
      loading: "جاري تحميل مفضلاتك..."
    },

    // Data Mappings (For Dropdowns)
    breeds: {
      "German Shepherd": "جيرمن شيبرد",
      "Husky": "هاسكي",
      "Labrador Retriever": "لابرادور ريتريفر",
      "Golden Retriever": "جولدن ريتريفر",
      "Pomeranian": "بوميرانيان",
      "Rottweiler": "روتوايلر",
      "Chihuahua": "شيواوا",
      "Pitbull": "بتبول",
      "Doberman": "دوبرمان",
      "Shih Tzu": "شيتزو",
      "Maltese": "مالتيز",
      "Samoyed": "سامويد",
      "Akita": "أكيتا",
      "Persian": "شيرازي (فارسي)",
      "Siamese": "سيامي",
      "Scottish Fold": "سكوتش فولد",
      "British Shorthair": "بريتش شورت هير",
      "Turkish Angora": "أنقرة تركي",
      "Maine Coon": "ماين كون",
      "Bengal": "بنغالي",
      "Sphynx": "سفينكس (فرعوني)",
      "Ragdoll": "راغ دول",
      "Russian Blue": "روسي أزرق",
      "Budgie": "بادجي",
      "Cockatiel": "كوكتيل",
      "Lovebird": "طير الحب",
      "Canary": "كناري",
      "Parrot": "ببغاء",
      "Goldfish": "سمك ذهبي",
      "Turtle": "سلحفاة",
      "Horse": "خيل",
      "Mixed / Other": "هجين / آخر",
      "Other": "أخرى"
    },
    items: {
      "Dog House": "بيت كلب",
      "Cat House": "بيت قطة",
      "Rodent House": "بيت قوارض",
      "Cages": "أقفاص",
      "Carrier": "حقيبة تنقل",
      "Pet Bed": "سرير حيوانات",
      "Pet Playpen": "ساحة لعب لأليفك",
      "Collar": "طوق",
      "Leash": "رباط (مقود)",
      "Toys": "ألعاب",
      "Food": "طعام",
      "Shampoo": "شامبو",
      "Other": "أخرى",
      "Harness": "سرج",
      "Clothing": "ملابس",
      "Shoes": "أحذية",
      "ID Tags": "بطاقات تعريفية",
      "Blanket": "بطانية",
      "Pillows": "وسائد",
      "Floor Mats": "سجاد أرضي",
      "Cooling Mats": "بساط تبريد",
      "Balls": "كرات",
      "Rope Toys": "ألعاب حبال",
      "Chew Toys": "ألعاب عض",
      "Cat Toys (Feathers/Laser)": "ألعاب قطط (ريش/ليزر)",
      "Hamster Wheel": "عجلة هامستر",
      "Cat Scratcher": "خداشة قطط",
      "Interactive Puzzles": "ألعاب ذكاء تفاعلية",
      "Shampoo & Conditioner": "شامبو وبلسم",
      "Brushes & Combs": "فراشي وأمشاط",
      "Nail Clippers": "قصاصة أظافر",
      "Litter Box": "صندوق فضلات",
      "Litter Scoops": "مجرفه فضلات",
      "Pee Pads": "لبادات تبول",
      "Cleanup Bags": "أكياس تنظيف",
      "Food Bowls": "أوعية طعام",
      "Water Bowls": "أوعية ماء",
      "Automatic Feeders": "موزع طعام تلقائي",
      "Water Fountains": "نافورات مياه",
      "Food Storage Containers": "حاوية تخزين طعام",
      "Perches": "مجثم",
      "Swings": "أراجيح",
      "Nests": "أعشاش",
      "Bird Toys": "ألعاب طيور",
      "Bird Baths": "أحواض استحمام طيور",
      "Decorations": "ديكورات",
      "Rocks & Gravel": "صخور وحصى",
      "Artificial Plants": "نباتات صناعية",
      "Backgrounds": "خلفيات"
    }
  }
}
