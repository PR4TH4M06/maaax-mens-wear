// lib/reviews.ts
// In-Built Smart Dynamic Review Synthesizer Engine (<20ms, Never Down, Zero Mandatory API)
// Supports 9 Categories, 3 Languages (English, Hinglish, Marathi), 3 Line-Length Modes, and Millions of Combinations.

import { isReviewUsedOrSimilar } from "./used";

export type ReviewLanguage = "hinglish" | "english" | "marathi";
export type ReviewLength = "short" | "medium" | "long";
export type ReviewCategory =
  | "all"
  | "clothes"
  | "staff"
  | "quality"
  | "fitting"
  | "pricing"
  | "loafers"
  | "partywear"
  | "offers";

export interface SynthesizedReview {
  review: string;
  category: ReviewCategory;
  language: ReviewLanguage;
  length: ReviewLength;
  engine: "inbuilt-synthesizer" | "groq-ai" | "gemini-ai";
  generationTimeMs: number;
}

// ============================================================================
// MARATHI MULTI-PATTERN VOCABULARY POOLS (Authentic Nashik/Maharashtrian Tone)
// ============================================================================

const MARATHI_OPENERS = [
  "आजच MAAAX MENS WEAR मधून खरेदी केली, अनुभव अतिशय उत्तम होता!",
  "नाशिकमधील खुटवड नगरमध्ये MAAAX MENS WEAR हे जेंट्स कपड्यांसाठी सर्वोत्तम दालन आहे.",
  "मित्राच्या सांगण्यावरून मी MAAAX MENS WEAR ला भेट दिली आणि कलेक्शन पाहून मन खुश झाले.",
  "MAAAX उद्योग समूहाच्या या शोरूममध्ये खरेदी करायला नेहमीच खूप छान वाटते.",
  "लग्नसराई आणि सणासुदीच्या कपड्यांसाठी MAAAX MENS WEAR ही माझी पहिली पसंती आहे.",
  "माझ्या वाढदिवसासाठी आणि पार्टी वेअरसाठी मी इथून शर्ट आणि जीन्स घेतली,",
  "कमी बजेटमध्ये रॉयल आणि ब्रँडेड लूक हवा असेल तर MAAAX MENS WEAR ला नक्की भेट द्या.",
  "ऑफिस वेअर आणि रोजच्या वापरासाठी कपडे घ्यायला मी MAAAX MENS WEAR मध्ये गेलो होतो,",
  "खूप दुकाने फिरलो पण MAAAX MENS WEAR सारखी व्हरायटी आणि रेट कुठेच मिळाले नाहीत.",
  "पहिल्यांदाच MAAAX MENS WEAR ला भेट दिली आणि आता मी इथला कायमचा ग्राहक झालो आहे.",
  "कुटुंबासोबत कालच MAAAX MENS WEAR मध्ये शॉपिंग केली, सर्वांनाच कपडे खूप आवडले.",
  "तरुणांसाठी लेटेस्ट फॅशन आणि ट्रेंडी कपडे मिळण्याचे हक्काचे ठिकाण म्हणजे MAAAX MENS WEAR!",
  "MAAAX MENS WEAR मध्ये पाऊल ठेवताच एका प्रीमियम शोरूममध्ये आल्यासारखे वाटते.",
  "भावाच्या लग्नासाठी आणि मित्रांसाठी आम्ही सर्वांनी इथूनच कपड्यांची खरेदी केली,",
];

const MARATHI_EXPERIENCES: Record<Exclude<ReviewCategory, "all">, string[]> = {
  clothes: [
    "इथे शर्ट्स, अरमानी पँट्स, जीन्स आणि टी-शर्ट्समध्ये खूप नवीन आणि ट्रेंडी व्हरायटी उपलब्ध आहे.",
    "कपड्यांचे कलेक्शन एकदम फ्रेश आणि लेटेस्ट फॅशनचे आहे, प्रत्येक रंगात आणि पॅटर्नमध्ये भन्नाट पर्याय मिळतात.",
    "फॉर्मल शर्ट्सपासून ते कॅज्युअल टी-शर्ट्स आणि डेनिम जीन्सपर्यंत सर्वच कपडे खूपच आकर्षक आहेत.",
    "प्रत्येक आठवड्याला नवीन स्टॉक येत असल्यामुळे इथे नेहमीच हटके आणि स्टायलिश डिझाईन्स पाहायला मिळतात.",
    "कोणत्याही कार्यक्रमासाठी किंवा रोजच्या वापरासाठी इथे एकापेक्षा एक भारी कपडे सहज मिळतात.",
    "इथले कपडे घातल्यावर लूक एकदम स्मार्ट दिसतो आणि मित्रही विचारतात की कुठून घेतले.",
  ],
  staff: [
    "इथला स्टाफ अतिशय विनम्र, मदत करणारा आणि आपुलकीने बोलणारा आहे.",
    "स्टाफने अजिबात घाई न करता खूप संयमाने आम्हाला सर्व नवीन पॅटर्न्स आणि साईज दाखवले.",
    "ग्राहकांशी बोलण्याची पद्धत आणि सेवा खरोखरच १० पैकी १० आहे, स्वतःच्या घरातील दुकानासारखा अनुभव येतो.",
    "कोणता रंग आणि कोणते कॉम्बिनेशन अंगावर चांगले दिसेल हे सांगण्यात इथला स्टाफ खूप मदत करतो.",
    "मालक आणि संपूर्ण टीमचा स्वभाव खूप मनमिळाऊ आहे, कितीही कपडे ट्राय केले तरी हसतमुखाने सेवा देतात.",
    "उत्तम ग्राहक सेवेमुळे MAAAX MENS WEAR मध्ये खरेदी करण्याचा आनंद द्विगुणित होतो.",
  ],
  quality: [
    "कपड्यांची क्वालिटी एक नंबर आहे! कितीही वेळा धुतले तरी रंग जात नाही आणि कापड आकसून जात नाही.",
    "कापडाचा दर्जा आणि शिलाई एकदम ब्रँडेड शोरूमसारखी मजबूत आणि प्रीमियम आहे.",
    "प्युअर कॉटन शर्ट्स आणि स्ट्रेचेबल जीन्सचे कापड अंगावर घालायला खूपच आरामदायक आणि मऊ आहे.",
    "हातात घेतल्यावरच कपड्याची भारी क्वालिटी आणि फिनिशिंग लगेच जाणवते.",
    "उन्हाळ्यात किंवा पूर्ण दिवस घातले तरी इथले कपडे खूप सुटसुटीत आणि आरामदायक वाटतात.",
    "क्वालिटीच्या बाबतीत MAAAX MENS WEAR मध्ये अजिबात तडजोड केली जात नाही हे विशेष कौतुकास्पद आहे.",
  ],
  fitting: [
    "शर्ट्स आणि अरमानी ट्राउझर्सची फिटिंग अगदी टेलरकडून शिवून घेतल्यासारखी परफेक्ट बसते!",
    "स्लिम फिट आणि रेग्युलर फिट दोन्हीमध्ये सर्व साईज उपलब्ध आहेत, कोणतीही अल्टरेशन करायची गरज पडली नाही.",
    "जीन्स आणि फॉर्मल पँट्सची कटिंग आणि स्ट्रेच इतका छान आहे की लूक एकदम शार्प आणि रुबाबदार दिसतो.",
    "ट्रायल रूमची सोय उत्तम असल्यामुळे स्वतःला हवी तशी परफेक्ट फिटिंग चेक करून कपडे घेता येतात.",
    "खांदे आणि छातीजवळ शर्ट्सची फिटिंग एकदम रॉयल बसते, ज्यामुळे आत्मविश्वास वाढतो.",
  ],
  pricing: [
    "किंमती एकदम सर्वसामान्यांच्या खिशाला परवडणाऱ्या आहेत! फक्त ₹500 मध्ये भारी शर्ट आणि ₹400 मध्ये अरमानी पँट मिळते.",
    "क्वालिटीच्या मानाने रेट खूपच योग्य आहेत — टी-शर्ट ₹300, जीन्स ₹800 आणि लोफर्स ₹500 पासून सुरू होतात.",
    "मोठ्या मॉलमध्ये जे कपडे हजारो रुपयांना मिळतात, ते इथे अतिशय वाजवी दरात मिळाले. पूर्ण पैसा वसूल खरेदी!",
    "फिक्स आणि प्रामाणिक रेट असल्यामुळे भाव करण्याची गरज पडत नाही आणि कमी बजेटमध्ये भरपूर खरेदी होते.",
    "अंडरगारमेंट्सवर मिळणारी फ्लॅट 20% सूट आणि कपड्यांचे परवडणारे दर खरोखरच फायदेशीर आहेत.",
  ],
  loafers: [
    "इथली ₹800 ची दमदार डेनिम जीन्स आणि ₹500 चे स्टायलिश लोफर्स यांची जोडी एकदम किलर लूक देते!",
    "कपड्यांसोबतच इथे पार्टी वेअर आणि कॅज्युअल लोफर्सचे कलेक्शन देखील खूपच आरामदायक आणि ट्रेंडी आहे.",
    "एकाच छताखाली भारी जीन्स, शर्ट्स आणि मऊ सोल असलेले लोफर्स मिळाल्यामुळे संपूर्ण आऊटफिट तयार झाला.",
    "जीन्सचे नवीन शेड्स आणि लोफर्सची फिनिशिंग पाहताच क्षणी पसंतीस उतरते.",
  ],
  partywear: [
    "लग्न, रिसेप्शन आणि पार्टीसाठी इथले पार्टी वेअर शर्ट्स आणि अरमानी फॉर्मल पँट्स एकदम रॉयल लूक देतात.",
    "कार्यक्रमात सर्वात वेगळे आणि स्मार्ट दिसायचे असेल तर इथले पार्टी वेअर कलेक्शन नक्की ट्राय करा.",
    "ऑफिस फॉर्मल्सपासून ते फेस्टिव्ह पार्टी आऊटफिट्सपर्यंत प्रत्येक खास प्रसंगासाठी इथे उत्तम रंगसंगती मिळते.",
    "इथून घेतलेला पार्टी वेअर ड्रेस घातल्यावर सर्व मित्रांनी आणि नातेवाईकांनी खूप कौतुक केले.",
  ],
  offers: [
    "इथल्या ऑफर्स खूपच जबरदस्त आहेत — शर्ट ₹500, अरमानी ₹400, टी-शर्ट ₹300 आणि अंडरगारमेंट्सवर थेट 20% OFF!",
    "कमी किमतीत जास्त आणि दर्जेदार कपडे घेण्यासाठी इथले कॉम्बो डील्स आणि ऑफर्स नाशिकमध्ये सर्वोत्तम आहेत.",
    "अंडरगारमेंट्सवर 20% डिस्काउंट आणि ₹500 मध्ये प्रीमियम शर्ट्स अशी धमाकेदार ऑफर इतरत्र कुठेच मिळत नाही.",
    "सण असो वा इतर दिवस, MAAAX MENS WEAR मध्ये ग्राहकांच्या फायद्याचेच रेट आणि ऑफर्स असतात.",
  ],
};

const MARATHI_SHORT_PUNCHES: Record<ReviewCategory, string[]> = {
  all: [
    "MAAAX MENS WEAR मध्ये कपड्यांची व्हरायटी, क्वालिटी आणि स्टाफची सेवा सर्व काही एक नंबर आहे! नक्की भेट द्या. ⭐⭐⭐⭐⭐",
    "खुटवड नगरमधील सर्वोत्तम जेंट्स शोरूम! ट्रेंडी शर्ट्स, अरमानी पँट्स आणि जीन्स अतिशय वाजवी दरात मिळतात.",
    "उत्तम क्वालिटी, परफेक्ट फिटिंग आणि विनम्र सेवा! MAAAX MENS WEAR मधून केलेली खरेदी पूर्णपणे पैसा वसूल ठरली. ⭐⭐⭐⭐⭐",
    "मराठी माणसाचा अभिमान असलेले MAAAX उद्योग समूहाचे हे दालन पुरुष फॅशनसाठी सर्वोत्तम ठिकाण आहे!",
  ],
  clothes: [
    "MAAAX MENS WEAR मध्ये लेटेस्ट फॅशनचे शर्ट्स, अरमानी ट्राउझर्स आणि टी-शर्ट्सचे अप्रतिम कलेक्शन आहे! ⭐⭐⭐⭐⭐",
    "प्रत्येक पॅटर्न आणि रंगात एकदम नवीन आणि स्टायलिश कपडे मिळण्याचे एकमेव ठिकाण म्हणजे MAAAX MENS WEAR!",
    "कपड्यांची एवढी मोठी आणि फ्रेश व्हरायटी पाहून मन खुश झाले. तरुणांसाठी बेस्ट शोरूम!",
  ],
  staff: [
    "MAAAX MENS WEAR चा स्टाफ अतिशय विनम्र, आपुलकीने बोलणारा आणि मदत करणारा आहे! १०/१० ग्राहक सेवा. ⭐⭐⭐⭐⭐",
    "खूप संयमाने आणि हसतमुखाने सर्व कपडे दाखवतात. अशा छान सेवेमुळे पुन्हा पुन्हा यावेसे वाटते!",
    "योग्य साईज आणि कलर कॉम्बिनेशन निवडण्यात स्टाफने खूप चांगली मदत केली. मनापासून धन्यवाद!",
  ],
  quality: [
    "MAAAX MENS WEAR च्या कपड्यांची कापड क्वालिटी आणि शिलाई एकदम ब्रँडेड आणि टिकाऊ आहे! ⭐⭐⭐⭐⭐",
    "धुतल्यानंतरही रंग आणि फिटिंग जशीच्या तशी राहते. प्युअर कॉटन आणि उत्तम दर्जाचे कपडे!",
    "अंगावर घालायला अतिशय आरामदायक आणि प्रीमियम फील देणारे कापड! क्वालिटी १००% खात्रीशीर.",
  ],
  fitting: [
    "MAAAX MENS WEAR मधील शर्ट्स आणि अरमानी पँट्सची फिटिंग अगदी टेलरमेड सारखी परफेक्ट बसते! ⭐⭐⭐⭐⭐",
    "कोणत्याही अल्टरेशनशिवाय एकदम स्मार्ट आणि शार्प फिटिंग मिळाली. सर्व साईज उपलब्ध आहेत!",
    "स्ट्रेचेबल जीन्स आणि स्लिम-फिट शर्ट्सची फिटिंग खरोखरच लाजवाब आहे. नक्की ट्राय करा!",
  ],
  pricing: [
    "शर्ट ₹500, अरमानी ₹400, टी-शर्ट ₹300 आणि जीन्स ₹800 — MAAAX MENS WEAR मध्ये सर्वात योग्य दरात भारी कपडे मिळतात! ⭐⭐⭐⭐⭐",
    "कमी बजेटमध्ये रॉयल आणि ब्रँडेड शॉपिंग! शिवाय अंडरगारमेंट्सवर 20% OFF सुद्धा मिळाला. पूर्ण पैसा वसूल!",
    "बाजारभावापेक्षा अत्यंत वाजवी रेट आणि एक नंबर क्वालिटी! सर्वसामान्यांच्या खिशाला परवडणारे हक्काचे दालन.",
  ],
  loafers: [
    "MAAAX MENS WEAR मधील ₹800 ची डेनिम जीन्स आणि ₹500 चे स्टायलिश लोफर्स एकदम जबरदस्त लूक देतात! ⭐⭐⭐⭐⭐",
    "कपड्यांसोबतच इथले आरामदायक लोफर्स आणि जीन्सचे कलेक्शन खूपच ट्रेंडी आणि मजबूत आहे!",
    "संपूर्ण आऊटफिट एकाच ठिकाणी! जीन्सचे शेड्स आणि लोफर्सची क्वालिटी खूपच आवडली.",
  ],
  partywear: [
    "लग्न आणि पार्टीसाठी रॉयल शर्ट्स आणि अरमानी फॉर्मल्स घ्यायचे असतील तर MAAAX MENS WEAR सर्वोत्तम आहे! ⭐⭐⭐⭐⭐",
    "पार्टी वेअर कपड्यांचे एकदम हटके आणि क्लासी कलेक्शन! प्रत्येक कार्यक्रमात चारचौघात उठून दिसणारा लूक मिळतो.",
    "ऑफिस फॉर्मल्स आणि फेस्टिव्ह वेअरसाठी नाशिकमधील सर्वात उत्तम शोरूम!",
  ],
  offers: [
    "MAAAX MENS WEAR मध्ये शर्ट ₹500, अरमानी ₹400 आणि अंडरगारमेंट्सवर थेट 20% सूट मिळते! सर्वोत्तम ऑफर. ⭐⭐⭐⭐⭐",
    "इतक्या कमी दरात इतके दर्जेदार कपडे आणि लोफर्स इतर कुठेही मिळणार नाहीत. धमाकेदार कॉम्बो ऑफर्स!",
    "ग्राहकांच्या फायद्याच्या ऑफर्स आणि उत्कृष्ट क्वालिटी! शॉपिंग करून खूप समाधान वाटले.",
  ],
};

const MARATHI_CONNECTORS = [
  "याशिवाय,",
  "तसेच,",
  "आणि सर्वात महत्त्वाचे म्हणजे",
  "खरे सांगायचे तर",
  "मला ही गोष्ट सुद्धा खूप आवडली की",
  "विशेष म्हणजे",
];

const MARATHI_LONG_EXTRAS = [
  "शोरूममधील स्वच्छता, आकर्षक प्रकाशव्यवस्था आणि ट्रायल रूमची सोय अतिशय उत्तम आहे.",
  "इथे शर्ट ₹500, अरमानी ट्राउझर्स ₹400, टी-शर्ट ₹300, जीन्स ₹800 आणि लोफर्स ₹500 पासून सुरू होतात, तसेच अंडरगारमेंट्सवर 20% सूट मिळते.",
  "मराठी व्यावसायिकाने उभे केलेले हे दालन पाहून खूप अभिमान वाटतो आणि इथली प्रत्येक वस्तू दर्जेदार आहे.",
  "माझ्या मित्रांना आणि नातेवाईकांनाही मी घेतलेले कपडे खूप आवडले आणि मी सर्वांना इथे येण्याचा नक्कीच सल्ला देईन.",
];

const MARATHI_CLOSERS = [
  "तुम्ही सुद्धा एकदा MAAAX MENS WEAR ला नक्की भेट द्या. माझ्याकडून ५ पैकी ५ स्टार! ⭐⭐⭐⭐⭐",
  "संपूर्ण पैसा वसूल अनुभव! मी माझ्या सर्व मित्रांना आणि परिवाराला इथूनच खरेदी करायला सांगेन.",
  "१००% समाधानी! आता जेंट्स कपड्यांच्या खरेदीसाठी इतर कुठेही जाण्याची गरज नाही.",
  "उत्तम कपडे, प्रामाणिक दर आणि आपुलकीची सेवा यासाठी MAAAX MENS WEAR ला मनापासून धन्यवाद!",
  "नाशिकमधील प्रत्येक फॅशनप्रेमी तरुणाने भेट द्यावे असे एकमेव ठिकाण. पुढच्या वेळीही मी इथेच येणार!",
  "अप्रतिम खरेदीचा अनुभव! MAAAX उद्योग समूहाला पुढील वाटचालीस खूप खूप शुभेच्छा. ⭐⭐⭐⭐⭐",
];

// ============================================================================
// HINGLISH MULTI-PATTERN VOCABULARY POOLS (Massive Combinatorial Variety)
// ============================================================================

const HINGLISH_OPENERS = [
  "Aaj hi MAAAX MENS WEAR se shopping ki,",
  "MAAAX MENS WEAR me mera shopping experience ekdum shandaar raha.",
  "Bhai sach me MAAAX MENS WEAR ka collection dekh ke maza aa gaya!",
  "Pichle hafte dost ke kehne par MAAAX MENS WEAR visit kiya tha,",
  "Agar aapko Nashik me premium men's wear chahiye toh MAAAX MENS WEAR best jagah hai.",
  "Maine apni party shopping ke liye MAAAX MENS WEAR choose kiya,",
  "MAAAX ke is showroom me aake dil khush ho gaya.",
  "Yahan se maine shirts, Armani trousers aur jeans li,",
  "Main pichle kaafi time se MAAAX MENS WEAR se kapde le raha hoon,",
  "Market me bohot dukaane dekhi par MAAAX MENS WEAR jaisa stock kahin nahi mila.",
  "Kal sham ko family ke saath MAAAX MENS WEAR gaya tha,",
  "Festival aur function ke kapdo ke liye MAAAX MENS WEAR meri first choice hai.",
  "First time MAAAX MENS WEAR visit kiya aur ab pakka regular customer ban gaya hoon.",
  "Gents wear ke maamle me MAAAX MENS WEAR ka koi tod nahi hai.",
  "Office wear aur casual outing dono ke liye yahan se shopping ki,",
  "Birthday outfit lene MAAAX MENS WEAR aaya tha,",
  "Honestly bolu toh MAAAX MENS WEAR ka ambiance aur collection dono royal hai.",
  "Mere bhai ki shaadi aur casual wear ke liye humne yahin se shopping ki,",
  "MAAAX MENS WEAR me kadam rakhte hi ekdum premium showroom wali vibe aati hai.",
  "College aur daily wear ke liye naye kapde lene MAAAX MENS WEAR gaya tha,",
  "Bina soche samjhe MAAAX MENS WEAR chale jao agar trendy aur smart dikhna hai toh.",
  "Aaj tak jitni bhi men's shops try ki, unme MAAAX MENS WEAR sabse top nikla.",
  "Khutwad Nagar me MAAAX MENS WEAR sabse best aur bharosemand gents showroom hai.",
  "Weekend par wardrobe upgrade karne ke liye MAAAX MENS WEAR gaya tha,",
  "Apne dosto ke saath MAAAX MENS WEAR me shopping karne aaya aur sabne kapde liye.",
  "Special occasion ke liye ekdum classy outfit dhoondh raha tha aur MAAAX me mil gaya.",
];

const HINGLISH_EXPERIENCES: Record<Exclude<ReviewCategory, "all">, string[]> = {
  clothes: [
    "yahan ke kapde bohot hi ache aur latest trend ke hain, har pattern me naye designs mil gaye.",
    "inke paas shirts, Armani trousers aur trendy t-shirts ki itni badi variety hai ki select karna mushkil ho gaya.",
    "kapdo ka collection ekdum fresh aur stylish hai, har age group ke liye mast options available hain.",
    "party wear shirts se lekar casual tees aur jeans tak sabhi kapde bohot classy aur modern lage.",
    "ache kapde dhoondhne walo ke liye ye showroom best hai, har hafte naya stock aur fresh colours milte hain.",
    "formal shirts, printed shirts aur Armani pants ka collection dekh kar hi premium feel aata hai.",
    "yahan har tarah ke gents wear me latest fashion aur sober se lekar funky tak saare colours mil jate hain.",
    "kapde itne shandaar aur trendy hain ki pehenne ke baad har koi poochta hai kahan se liya.",
    "har rack me ek se badhkar ek naye designs aur colour combinations dekhne ko mile.",
    "chahe simple sober look chahiye ya stylish streetwear, inka collection har mood ke hisab se best hai.",
  ],
  staff: [
    "yahan ka staff bohot achha, polite aur helpful hai, unhone bina kisi jaldbazi ke saare designs dikhaye.",
    "staff ka behaviour ekdum friendly hai, unhone meri choice aur body type samajh kar best outfit suggest kiya.",
    "sabse acchi baat yahan ke staff ki service lagi — bohot izzat aur patience ke saath attend karte hain.",
    "sales team aur owner dono ka nature bohot humble hai, kitne bhi kapde try karo wo hamesha smile ke saath dikhate hain.",
    "staff achha ho toh shopping ka maza double ho jata hai, aur MAAAX MENS WEAR ki team sach me 10/10 hai.",
    "yahan ke staff ko fashion aur colour combination ki bohot acchi samajh hai, unki wajah se best pair mila.",
    "customer service ekdum VIP level ki hai, staff har customer ko poora time aur attention deta hai.",
    "staff bohot cooperative hai aur size ya trial me poori madad karte hain.",
    "dukaan me ghuste hi jis tarah se welcome karte hain aur kapde dikhate hain, wo dil jeet leta hai.",
  ],
  quality: [
    "kapdo ki quality bohot achhi hai! Dhone ke baad bhi na colour fade hota hai aur na kapda shrink hota hai.",
    "fabric quality ekdum export aur branded level ki hai, hath lagate hi kapde ki richness pata chalti hai.",
    "stitching, buttons aur cloth material sab kuch A1 quality ka hai, garmi me bhi pehenne me bohot comfortable hai.",
    "quality achhi hai aur kapde kaafi durable lagte hain, pure cotton aur stretchable denim ka feel hi alag hai.",
    "maine inki shirts aur jeans pehle bhi use ki hain, salo-saal kapda bilkul naye jaisa rehta hai.",
    "har ek piece ki finishing aur fabric softness bohot zabardast hai, skin pe ekdum breathable lagta hai.",
    "branded showroom wali premium quality yahan bohot hi genuine daam me mil rahi hai.",
    "kapde ki shine aur dhaage ki majbooti dekh kar hi samajh aata hai ki quality se koi compromise nahi kiya gaya.",
    "cotton shirts aur stretchable trousers ka kapda itna soft aur rich hai ki pehen ke maza aa gaya.",
  ],
  fitting: [
    "fitting itni perfect aayi jaise tailor se naap dekar banwaya ho! Slim fit aur regular fit dono me mast sizes hain.",
    "Armani trousers aur shirts ki fitting ekdum sharp aur smart look deti hai.",
    "yahan har body size ke hisab se exact fitting mil jati hai, trial room ki suvidha bhi bohot badhiya hai.",
    "jeans aur formal pants ka cut aur stretch itna comfortable hai ki poore din pehenne par bhi thakan nahi hoti.",
    "shoulder aur chest se shirts ki fitting ekdum royal baith-ti hai, bilkul alteration ki zaroorat nahi padi.",
    "agar aapko smart aur well-fitted look chahiye toh inke Armani pattern trousers aur shirts zaroor try karein.",
    "ankle-fit pants aur slim-fit shirts ka pattern ekdum modern youth ke hisab se design kiya gaya hai.",
  ],
  pricing: [
    "rates ekdum pocket-friendly aur wajib hain! ₹500 me itni bhari shirt aur ₹400 me Armani pant milna mushkil hai.",
    "quality ke hisab se pricing bohot sahi hai, aur undergarments pe 20% OFF wala offer bhi bohot badiya laga.",
    "full paisa vasool shopping hui! ₹300 se T-shirt aur ₹800 se heavy jeans start hai jo market se kaafi sasta aur accha hai.",
    "bade malls me jo kapde hazaro ke milte hain, wo yahan bohot hi reasonable rate me mil gaye.",
    "fixed aur genuine rate hone ki wajah se bargaining ka jhanjhat nahi rehta aur har budget me kaam ho jata hai.",
    "itne kam budget me pura wardrobe upgrade ho gaya, shirts, jeans aur loafers sab pe best deal mili.",
    "middle class aur youth budget ke hisab se isse sasta aur isse badhiya showroom poore area me nahi hai.",
  ],
  loafers: [
    "yahan ki rugged jeans aur stylish loafers ki jodi ekdum killer look deti hai!",
    "sirf ₹500 me itne comfortable aur classy loafers mil gaye, saath me ₹800 wali stretchable jeans bhi bohot shandaar hai.",
    "kapdo ke saath-saath inke paas loafers aur footwear ka collection bhi bohot trendy aur cushioned hai.",
    "denim jeans ke shades aur loafers ki finishing dekh ke dil khush ho gaya, complete outfit ek hi chhat ke neeche mil gaya.",
    "party wear loafers aur ankle-fit jeans ka combination yahan se liya, dosto ne bohot tareef ki.",
    "heavy denim jeans aur soft sole wale loafers dono ki quality aur look lajawab hai.",
  ],
  partywear: [
    "party wear shirts, royal black aur pastel shades, aur formal Armani trousers ka collection kisi designer studio se kam nahi hai.",
    "shaadi, reception aur birthday party ke liye yahan ekdum classy aur VIP look wale outfits mil jate hain.",
    "office formals se lekar night party wear shirts tak, har occasion ke liye yahan best matching combinations available hain.",
    "agar kisi function me sabse alag aur handsome dikhna hai toh inka party wear aur Armani collection zaroor dekhein.",
    "rich satin finish shirts aur tailored formal trousers pehenne ke baad ekdum gentleman look aata hai.",
  ],
  offers: [
    "yahan ke combo deals aur offers lajawab hain — Shirt ₹500, Armani ₹400, T-shirt ₹300 aur undergarments pe seedha 20% OFF mil raha hai!",
    "ek hi jagah par kapde, loafers aur undergarments sab par itne shandaar offers mil gaye ki double shopping ho gayi.",
    "undergarments par flat 20% discount aur ₹500 wali premium shirts ka offer sach me poore market me sabse best hai.",
    "festival ho ya normal din, MAAAX MENS WEAR me hamesha customer ke fayde wale rates aur combo offers milte hain.",
    "puri family ke gents ke liye humne combo me shopping ki aur budget me dher saare branded feel wale kapde mil gaye.",
  ],
};

const HINGLISH_SHORT_PUNCHES: Record<ReviewCategory, string[]> = {
  all: [
    "MAAAX MENS WEAR me kapdo ka collection, fitting aur staff behaviour sab kuch 10/10 hai! Full paisa vasool showroom, highly recommended. ⭐⭐⭐⭐⭐",
    "Best men's wear shop in Khutwad Nagar! Latest fashion shirts, Armani trousers aur jeans bohot hi sahi rate me milte hain. Must visit!",
    "Shandaar collection aur ekdum premium quality! MAAAX MENS WEAR se shopping karke dil khush ho gaya. Definitely 5 stars!",
    "Top class gents wear showroom! Kapdo ki variety, polite staff aur pocket-friendly rates — sab kuch ekdum perfect hai.",
  ],
  clothes: [
    "MAAAX MENS WEAR me kapdo ka collection ekdum latest aur trendy hai! Shirts, Armani pants aur tees ki lajawab variety. ⭐⭐⭐⭐⭐",
    "Bohat hi shandaar aur fresh fashion stock! Har occasion ke liye ache aur stylish kapde ek hi chhat ke neeche mil gaye.",
    "Latest trend ke shirts aur trousers lene ke liye MAAAX MENS WEAR best jagah hai. Collection dekh ke maza aa gaya!",
  ],
  staff: [
    "MAAAX MENS WEAR ka staff bohot hi polite, humble aur helpful hai! Bohot pyar aur patience se saare kapde dikhate hain. ⭐⭐⭐⭐⭐",
    "10/10 customer service! Staff ne best colour combination aur exact size choose karne me poori madad ki. Highly recommended!",
    "Itna friendly aur cooperative staff bohot kam dekhne milta hai. Shopping experience ekdum smooth aur badhiya raha!",
  ],
  quality: [
    "MAAAX MENS WEAR ke kapdo ki fabric quality aur stitching ekdum A1 branded level ki hai! Dhone ke baad bhi colour naye jaisa rehta hai. ⭐⭐⭐⭐⭐",
    "Pure cotton shirts aur stretchable jeans ki quality bohot hi rich aur comfortable hai. Zero compromise on quality!",
    "Hath lagate hi kapde ki premium quality pata chalti hai. Long-lasting aur breathable fabric, full 5 star rating!",
  ],
  fitting: [
    "MAAAX MENS WEAR ke Armani trousers aur shirts ki fitting ekdum tailor-made jaisi perfect aati hai! Smart look guaranteed. ⭐⭐⭐⭐⭐",
    "Slim-fit shirts aur stretchable jeans ki fitting lajawab hai, bina kisi alteration ke exact size mil gaya!",
    "Perfect fitting aur bohot saare size options! Pehenne ke baad ekdum sharp aur confident look aata hai.",
  ],
  pricing: [
    "Shirt ₹500, Armani ₹400, T-shirt ₹300 aur Jeans ₹800 — MAAAX MENS WEAR me branded quality sabse wajib rate me milti hai! Full paisa vasool.",
    "Kam budget me royal aur trendy shopping ke liye best showroom! Undergarments pe 20% OFF bhi mil gaya. ⭐⭐⭐⭐⭐",
    "Market se sabse sahi rate aur top quality! Bina jeb par bhari pade pura wardrobe upgrade ho gaya.",
  ],
  loafers: [
    "MAAAX MENS WEAR ki ₹800 wali rugged jeans aur ₹500 wale stylish loafers ki jodi ekdum killer look deti hai! Must try.",
    "Kapdo ke saath-saath yahan ke comfortable loafers aur heavy denim jeans ka collection bhi bohot shandaar hai! ⭐⭐⭐⭐⭐",
    "Complete head-to-toe men's fashion! Jeans ke shades aur loafers ki cushioning dono top class hain.",
  ],
  partywear: [
    "Party wear shirts aur formal Armani trousers ke liye MAAAX MENS WEAR best destination hai! Ekdum VIP aur classy look milta hai. ⭐⭐⭐⭐⭐",
    "Shaadi aur functions ke liye yahan se party wear outfit liya, har kisi ne tareef ki. Shandaar collection!",
    "Office formals se lekar night party wear tak, MAAAX MENS WEAR me har mauke ke liye royal kapde milte hain.",
  ],
  offers: [
    "MAAAX MENS WEAR ke offers kamaal ke hain — Shirts ₹500, Armani ₹400 aur undergarments par flat 20% OFF! Best deal in town. ⭐⭐⭐⭐⭐",
    "Har season me sabse behtareen combo offers aur discounts! Paisa vasool shopping ke liye zaroor visit karein.",
    "Branded feel wale kapde aur loafers itne badiya offer price me kahin aur nahi milenge. 100% satisfied!",
  ],
};

const HINGLISH_CONNECTORS = [
  "Iske alawa,",
  "Saath hi,",
  "Aur sabse badiya baat ye ki",
  "Sach kahu toh",
  "Mujhe ye bhi bohot pasand aaya ki",
  "Plus point ye hai ki",
  "Ek aur cheez jo dil jeet gayi —",
  "Sabse khaas baat ye rahi ki",
];

const HINGLISH_LONG_EXTRAS = [
  "Showroom ki lighting, trial room ki suvidha aur safai bhi ekdum bade brand store jaisi hai.",
  "Yahan Shirt ₹500, Armani pant ₹400, T-shirt ₹300, Jeans ₹800 aur Loafers ₹500 se start hote hain, plus undergarments par 20% discount bhi milta hai.",
  "Har hafte naya stock aata hai isliye jab bhi jao kuch naya aur trendy dekhne ko milta hai.",
  "Billing process bhi bohot fast hai aur parking ya location dhoondhne me bhi koi dikkat nahi hoti.",
  "Maine apne dosto ko bhi yahan ke kapde dikhaye aur wo bhi agle hi din shopping karne pahunch gaye.",
];

const HINGLISH_CLOSERS = [
  "Sabhi bhaiyo ko MAAAX MENS WEAR ek baar zaroor visit karne ki salah dunga. Full 5 star! ⭐⭐⭐⭐⭐",
  "Paisa vasool experience raha, main apne saare dosto aur family ko yahi recommend karunga.",
  "Definitely 5 out of 5 stars! Next time bhi shopping ke liye yahin aaunga.",
  "Agar aapko kam budget me royal aur branded look chahiye toh MAAAX MENS WEAR is the best!",
  "Dil se 5 star rating! Aisi quality aur service bar-bar aane pe majboor karti hai.",
  "Must visit showroom for every men's fashion lover. Keep up the great work team MAAAX!",
  "100% satisfied! Ab kapdo ki shopping ke liye kahin aur jaane ki zaroorat nahi.",
  "Best men's wear shop in the area. Overall experience bohot hi yaadgar aur badhiya raha!",
  "Highly recommended! Ek baar visit karke dekho, aap bhi inke collection ke fan ho jaoge.",
  "Bohat hi shandaar anubhav raha. Thank you MAAAX MENS WEAR for such amazing outfits!",
];

// ============================================================================
// ENGLISH MULTI-PATTERN VOCABULARY POOLS (Massive Combinatorial Variety)
// ============================================================================

const ENGLISH_OPENERS = [
  "Just finished shopping at MAAAX MENS WEAR and I am thoroughly impressed!",
  "Had a wonderful retail experience at MAAAX MENS WEAR today.",
  "If you are looking for stylish and dependable men's fashion, MAAAX MENS WEAR is the place to visit.",
  "Visited MAAAX MENS WEAR on a friend's recommendation and it exceeded all my expectations.",
  "MAAAX MENS WEAR offers one of the finest men's clothing collections I have seen in Nashik.",
  "Picked up my festive and formal wardrobe from MAAAX MENS WEAR this week.",
  "Stepping into MAAAX MENS WEAR feels like visiting a truly premium men's boutique.",
  "I have been shopping at MAAAX MENS WEAR for a while now and they never disappoint.",
  "Stopped by MAAAX MENS WEAR to grab a couple of shirts and ended up buying a complete outfit!",
  "Hands down the best men's apparel showroom in Khutwad Nagar with an incredible vibe.",
  "Went to MAAAX MENS WEAR for some smart casuals and formal Armani trousers yesterday.",
  "Finding great quality men's clothing at honest prices is rare, and MAAAX MENS WEAR nails it.",
  "From the store presentation to the clothing racks, MAAAX MENS WEAR maintains top-notch standards.",
  "Shopped at MAAAX MENS WEAR for an upcoming family event and found the exact look I wanted.",
  "Upgraded my everyday and office wardrobe at MAAAX MENS WEAR and loved every single piece.",
  "Whether you want trendy streetwear or sharp formals, MAAAX MENS WEAR is a complete paradise for men.",
];

const ENGLISH_EXPERIENCES: Record<Exclude<ReviewCategory, "all">, string[]> = {
  clothes: [
    "Their clothing collection is remarkably fresh, featuring trendy shirts, smart Armani trousers, and modern casual t-shirts.",
    "The variety of clothes here is outstanding — whether you want crisp office formals, party wear shirts, or relaxed weekend tees, they have it all.",
    "Every rack is stocked with contemporary designs, rich colors, and stylish patterns that immediately stand out.",
    "They carry an impressive range of men's fashion that caters to both classic gentlemen and youth looking for trendy outfits.",
    "I loved how well-curated their clothes are; you don't have to dig through piles to find a sharp, fashionable shirt or pair of trousers.",
    "From structured collar shirts to comfortable daily t-shirts, the entire apparel lineup feels handpicked for style.",
    "New arrivals and fresh color palettes make browsing through their racks a genuinely exciting experience.",
  ],
  staff: [
    "The staff here is exceptionally polite, patient, and attentive without ever being pushy.",
    "What truly sets this showroom apart is the courteous staff — they helped me match colors and find the right sizes effortlessly.",
    "Customer service is a solid 10/10; the team greets you warmly and happily shows multiple options until you are completely satisfied.",
    "The staff members have a great eye for men's styling and recommended combinations that suited me perfectly.",
    "Very humble and professional staff! They made the entire trial and billing process smooth and enjoyable.",
    "It is refreshing to see showroom staff who genuinely care about helping customers look their best.",
  ],
  quality: [
    "The fabric quality is genuinely top-tier — soft, breathable cottons and durable stitching that feels luxurious on the skin.",
    "You can immediately feel the superior quality of the cloth; the colors stay vibrant and the fit holds up wash after wash.",
    "Every garment shows great attention to detail, from the collar structure and buttons to the heavy-grade denim fabric.",
    "The material quality rivals big national brands, offering high comfort for all-day wear in any weather.",
    "I am super impressed by the fabric finish and durability — zero compromise on textile quality.",
    "Both the shirts and trousers have a refined texture and premium drape that looks very sophisticated.",
  ],
  fitting: [
    "The fitting of their Armani trousers and tailored shirts is spot-on, giving a sharp silhouette right off the rack.",
    "Finding the right fit is effortless here — their sizes are accurate and the stretch fabrics contour comfortably.",
    "The cuts and patterns are tailored for a modern, confident look without feeling tight or restrictive.",
    "Tried on their slim-fit shirts and ankle-length trousers, and the fit looked almost custom-tailored.",
    "Great size availability and clean trial rooms make it super easy to verify the exact fit before buying.",
  ],
  pricing: [
    "The pricing is unbeatable — getting premium shirts starting at ₹500 and Armani trousers at ₹400 is incredible value for money.",
    "With t-shirts from ₹300, heavy jeans at ₹800, and flat 20% OFF on undergarments, it is easily the most pocket-friendly premium store.",
    "True value for money! You get boutique-level men's fashion at wholesale-friendly prices.",
    "Honest and transparent pricing across all sections makes upgrading your wardrobe completely guilt-free.",
    "The deals here are unmatched — high-end look without burning a hole in your pocket.",
  ],
  loafers: [
    "Their designer denim jeans and stylish loafers starting at ₹500 make it a complete head-to-toe fashion destination.",
    "Paired their ₹800 stretch denim jeans with a sleek pair of loafers from their footwear section and the look is killer.",
    "Not only are the clothes great, but their collection of comfortable loafers and rugged jeans is also super impressive.",
    "Loved the cushioned comfort of their loafers and the rich washes available in the denim jeans section.",
    "Getting premium jeans alongside classy party and casual loafers under one roof saved me so much time.",
  ],
  partywear: [
    "Their party wear shirts and formal Armani trousers are absolute showstoppers for weddings, receptions, and special evenings.",
    "If you need a sharp, head-turning outfit for an event or corporate meeting, their formal and party wear line is unmatched.",
    "Rich textures, classy prints, and crisp formal trousers make MAAAX MENS WEAR the best spot for occasion dressing.",
    "Picked up a complete party ensemble here and received so many compliments on the color and tailored look.",
  ],
  offers: [
    "The store offers and combo deals are fantastic — Shirts at ₹500, Armani trousers at ₹400, T-shirts at ₹300, plus a flat 20% discount on branded undergarments!",
    "You get amazing bundle value here; I refreshed my entire wardrobe along with loafers and essentials at a fraction of mall prices.",
    "The flat 20% OFF on undergarments alongside pocket-friendly rates on shirts and denim makes every visit super rewarding.",
    "Great promotional deals all year round without ever compromising on the freshness or quality of the garments.",
  ],
};

const ENGLISH_SHORT_PUNCHES: Record<ReviewCategory, string[]> = {
  all: [
    "Best men's wear showroom in Khutwad Nagar! Amazing collection, polite staff, and unbeatable prices at MAAAX MENS WEAR. ⭐⭐⭐⭐⭐",
    "Top-notch quality shirts, Armani trousers, and jeans at super honest prices. Highly recommend visiting MAAAX MENS WEAR!",
    "Fantastic shopping experience at MAAAX MENS WEAR! Great variety, sharp fitting, and 5-star customer service.",
    "One-stop destination for stylish men's fashion, denim, and loafers. True value for money! ⭐⭐⭐⭐⭐",
  ],
  clothes: [
    "Incredible variety of trendy shirts, Armani trousers, and casual tees at MAAAX MENS WEAR! Fresh styles on every rack. ⭐⭐⭐⭐⭐",
    "Loved the latest men's fashion collection at MAAAX MENS WEAR — modern designs and vibrant colors for every occasion!",
    "Best clothing selection in town! Whether you want formals or casual streetwear, MAAAX MENS WEAR has it all.",
  ],
  staff: [
    "Super polite, patient, and helpful staff at MAAAX MENS WEAR! They helped me pick the best outfit effortlessly. ⭐⭐⭐⭐⭐",
    "10/10 customer service! The team at MAAAX MENS WEAR is humble, welcoming, and great with styling advice.",
    "Wonderful hospitality and courteous staff who genuinely care about customer satisfaction. Highly recommended!",
  ],
  quality: [
    "Top-tier fabric quality and durable stitching at MAAAX MENS WEAR! Breathable cottons and rich denim that last long. ⭐⭐⭐⭐⭐",
    "Zero compromise on textile quality — the shirts and Armani trousers feel super comfortable and look premium!",
    "Impressive garment finish and color durability even after multiple washes. A true 5-star quality store!",
  ],
  fitting: [
    "Tailor-like sharp fitting right off the rack! The slim-fit shirts and Armani trousers at MAAAX MENS WEAR fit like a dream. ⭐⭐⭐⭐⭐",
    "Spot-on sizing and comfortable stretch fabrics that give a confident, modern silhouette. Loved the fit!",
    "Great trial rooms and accurate sizes for every body type. Best-fitting men's clothes in the area!",
  ],
  pricing: [
    "Unbeatable value at MAAAX MENS WEAR — Shirts ₹500, Armani ₹400, T-Shirts ₹300, Jeans ₹800, plus 20% OFF on undergarments! ⭐⭐⭐⭐⭐",
    "Premium showroom quality at super pocket-friendly prices! Upgraded my entire wardrobe on a smart budget.",
    "Honest, fixed pricing with the best deals on men's fashion in Nashik. 100% worth every rupee!",
  ],
  loafers: [
    "Killer combination of ₹800 rugged denim jeans and ₹500 stylish loafers at MAAAX MENS WEAR! Complete outfit under one roof. ⭐⭐⭐⭐⭐",
    "Loved the cushioned comfort of their loafers and the trendy washes in the jeans section. Must visit!",
    "Great footwear and denim collection! Picked up a pair of classy loafers and stretch jeans and they look awesome.",
  ],
  partywear: [
    "Best showroom for party wear shirts and crisp formal Armani trousers! Got a sharp, head-turning look at MAAAX MENS WEAR. ⭐⭐⭐⭐⭐",
    "Classy festive and wedding guest outfits for men with rich colors and tailored elegance. Highly recommended!",
    "From sharp office formals to club and party wear, MAAAX MENS WEAR has the finest occasion collection.",
  ],
  offers: [
    "Amazing deals at MAAAX MENS WEAR — flat 20% OFF on undergarments and starting rates from just ₹300 to ₹800! ⭐⭐⭐⭐⭐",
    "Best combo value and store offers in town! Premium shirts, trousers, and loafers at unbelievable prices.",
    "Super rewarding discounts across all men's wear sections. Great quality paired with unbeatable offers!",
  ],
};

const ENGLISH_CONNECTORS = [
  "Moreover,",
  "On top of that,",
  "Additionally,",
  "What made it even better is that",
  "I also really appreciated that",
  "Another highlight is that",
  "Best of all,",
];

const ENGLISH_LONG_EXTRAS = [
  "The showroom is well-lit, neatly organized, and features comfortable trial rooms for a hassle-free experience.",
  "With shirts at ₹500, Armani trousers at ₹400, t-shirts at ₹300, jeans at ₹800, loafers at ₹500, and 20% OFF on undergarments, the value is unmatched.",
  "They update their stock regularly, so you always find the latest seasonal trends and fresh color palettes.",
  "My friends and family were super impressed with the outfits I bought, and I will definitely be a regular here.",
];

const ENGLISH_CLOSERS = [
  "Highly recommend MAAAX MENS WEAR to everyone looking to upgrade their style. Deserves a full 5-star rating! ⭐⭐⭐⭐⭐",
  "Definitely my new go-to destination for men's shopping. Will be coming back soon with friends!",
  "Five stars all the way! Thank you MAAAX MENS WEAR for a seamless and rewarding shopping experience.",
  "A must-visit men's showroom if you value great quality, polite service, and fair pricing.",
  "100% satisfied with my purchase. Keep up the fantastic work, team MAAAX!",
  "If you want a sharp, premium look on a smart budget, do visit MAAAX MENS WEAR!",
  "Overall an outstanding men's hub in Khutwad Nagar. Highly recommended!",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Synthesizes a single candidate review in <1ms according to Category, Language, and Line-Length
 */
function buildCandidateReview(
  category: ReviewCategory,
  language: ReviewLanguage,
  length: ReviewLength
): string {
  const allSubCategories: Exclude<ReviewCategory, "all">[] = [
    "clothes",
    "staff",
    "quality",
    "fitting",
    "pricing",
    "loafers",
    "partywear",
    "offers",
  ];

  const primaryCat: Exclude<ReviewCategory, "all"> =
    category === "all" ? pickRandom(allSubCategories) : category;

  const remainingCats = allSubCategories.filter((c) => c !== primaryCat);
  const secondaryCat = pickRandom(remainingCats);
  const tertiaryCat = pickRandom(
    remainingCats.filter((c) => c !== secondaryCat)
  );

  // 1. SHORT (1-2 Lines): Crisp, punchy, fast to read
  if (length === "short") {
    if (language === "marathi") {
      if (Math.random() < 0.55) {
        return pickRandom(MARATHI_SHORT_PUNCHES[category]);
      }
      const opener = pickRandom(MARATHI_OPENERS);
      const exp1 = pickRandom(MARATHI_EXPERIENCES[primaryCat]);
      return `${opener} ${exp1} ⭐⭐⭐⭐⭐`.replace(/\s+/g, " ").trim();
    } else if (language === "hinglish") {
      if (Math.random() < 0.55) {
        return pickRandom(HINGLISH_SHORT_PUNCHES[category]);
      }
      const opener = pickRandom(HINGLISH_OPENERS);
      const exp1 = pickRandom(HINGLISH_EXPERIENCES[primaryCat]);
      return `${opener} ${exp1} Full 5 star! ⭐⭐⭐⭐⭐`
        .replace(/\s+/g, " ")
        .trim();
    } else {
      if (Math.random() < 0.55) {
        return pickRandom(ENGLISH_SHORT_PUNCHES[category]);
      }
      const opener = pickRandom(ENGLISH_OPENERS);
      const exp1 = pickRandom(ENGLISH_EXPERIENCES[primaryCat]);
      return `${opener} ${exp1}`
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // 2. LONG (4-5 Lines): Detailed, comprehensive customer story with multiple aspects
  if (length === "long") {
    if (language === "marathi") {
      const opener = pickRandom(MARATHI_OPENERS);
      const exp1 = pickRandom(MARATHI_EXPERIENCES[primaryCat]);
      const connector = pickRandom(MARATHI_CONNECTORS);
      const exp2 = pickRandom(MARATHI_EXPERIENCES[secondaryCat]);
      const extra = pickRandom(MARATHI_LONG_EXTRAS);
      const exp3 = pickRandom(MARATHI_EXPERIENCES[tertiaryCat]);
      const closer = pickRandom(MARATHI_CLOSERS);

      const secondSentence = `${connector} ${exp2}`;
      const thirdSentence =
        Math.random() < 0.6 ? extra : `तसेच ${exp3}`;

      return [opener, exp1, secondSentence, thirdSentence, closer]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } else if (language === "hinglish") {
      const opener = pickRandom(HINGLISH_OPENERS);
      const exp1 = pickRandom(HINGLISH_EXPERIENCES[primaryCat]);
      const connector = pickRandom(HINGLISH_CONNECTORS);
      const exp2 = pickRandom(HINGLISH_EXPERIENCES[secondaryCat]);
      const extra = pickRandom(HINGLISH_LONG_EXTRAS);
      const exp3 = pickRandom(HINGLISH_EXPERIENCES[tertiaryCat]);
      const closer = pickRandom(HINGLISH_CLOSERS);

      const secondSentence = `${connector} ${exp2.charAt(0).toLowerCase()}${exp2.slice(1)}`;
      const thirdSentence =
        Math.random() < 0.6
          ? extra
          : `Saath hi, ${exp3.charAt(0).toLowerCase()}${exp3.slice(1)}`;

      return [opener, exp1, secondSentence, thirdSentence, closer]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    } else {
      const opener = pickRandom(ENGLISH_OPENERS);
      const exp1 = pickRandom(ENGLISH_EXPERIENCES[primaryCat]);
      const connector = pickRandom(ENGLISH_CONNECTORS);
      const exp2 = pickRandom(ENGLISH_EXPERIENCES[secondaryCat]);
      const extra = pickRandom(ENGLISH_LONG_EXTRAS);
      const exp3 = pickRandom(ENGLISH_EXPERIENCES[tertiaryCat]);
      const closer = pickRandom(ENGLISH_CLOSERS);

      const secondSentence = `${connector} ${exp2.charAt(0).toLowerCase()}${exp2.slice(1)}`;
      const thirdSentence = Math.random() < 0.6 ? extra : exp3;

      return [opener, exp1, secondSentence, thirdSentence, closer]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // 3. MEDIUM (2-3 Lines - Default Balanced)
  const patternRoll = Math.random();
  if (language === "marathi") {
    const opener = pickRandom(MARATHI_OPENERS);
    const exp1 = pickRandom(MARATHI_EXPERIENCES[primaryCat]);
    const exp2 = pickRandom(MARATHI_EXPERIENCES[secondaryCat]);
    const connector = pickRandom(MARATHI_CONNECTORS);
    const closer = pickRandom(MARATHI_CLOSERS);

    if (patternRoll < 0.45) {
      return [opener, exp1, closer].join(" ").replace(/\s+/g, " ").trim();
    } else {
      return [opener, exp1, `${connector} ${exp2}`, closer]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } else if (language === "hinglish") {
    const opener = pickRandom(HINGLISH_OPENERS);
    const exp1 = pickRandom(HINGLISH_EXPERIENCES[primaryCat]);
    const exp2 = pickRandom(HINGLISH_EXPERIENCES[secondaryCat]);
    const connector = pickRandom(HINGLISH_CONNECTORS);
    const closer = pickRandom(HINGLISH_CLOSERS);

    if (patternRoll < 0.45) {
      return [opener, exp1, closer].join(" ").replace(/\s+/g, " ").trim();
    } else {
      const secondSentence = `${connector} ${exp2.charAt(0).toLowerCase()}${exp2.slice(1)}`;
      return [opener, exp1, secondSentence, closer]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } else {
    const opener = pickRandom(ENGLISH_OPENERS);
    const exp1 = pickRandom(ENGLISH_EXPERIENCES[primaryCat]);
    const exp2 = pickRandom(ENGLISH_EXPERIENCES[secondaryCat]);
    const connector = pickRandom(ENGLISH_CONNECTORS);
    const closer = pickRandom(ENGLISH_CLOSERS);

    if (patternRoll < 0.45) {
      return [opener, exp1, closer].join(" ").replace(/\s+/g, " ").trim();
    } else {
      const loweredExp2 = `${exp2.charAt(0).toLowerCase()}${exp2.slice(1)}`;
      return [opener, exp1, `${connector} ${loweredExp2}`, closer]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  }
}

/**
 * Generates a unique, non-repeating review using the In-Built Smart Synthesizer (<20ms).
 */
export function synthesizeUniqueReview(options: {
  category?: ReviewCategory;
  language?: ReviewLanguage;
  length?: ReviewLength;
  excludeReviews?: string[];
  usedHashes?: Set<string>;
  customValidator?: (candidate: string) => boolean;
}): SynthesizedReview {
  const start = performance.now();
  const category = options.category || "all";
  const language = options.language || "hinglish";
  const length = options.length || "medium";
  const excludeReviews = options.excludeReviews || [];
  const usedHashes = options.usedHashes;

  let bestCandidate = "";
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = buildCandidateReview(category, language, length);
    bestCandidate = candidate;

    const threshold = attempt < 25 ? 0.52 : attempt < 38 ? 0.62 : 0.72;

    const rejectedByValidator = options.customValidator
      ? options.customValidator(candidate)
      : isReviewUsedOrSimilar(candidate, excludeReviews, usedHashes, threshold);

    if (!rejectedByValidator) {
      break;
    }
  }

  const elapsed = Math.max(
    1,
    Math.round((performance.now() - start) * 100) / 100
  );

  return {
    review: bestCandidate,
    category,
    language,
    length,
    engine: "inbuilt-synthesizer",
    generationTimeMs: elapsed,
  };
}

/**
 * Optional External AI Provider Support (Groq / Gemini) + Instant Synthesizer Fallback
 */
export async function generateSmartReview(options: {
  category?: ReviewCategory;
  language?: ReviewLanguage;
  length?: ReviewLength;
  excludeReviews?: string[];
  usedHashes?: Set<string>;
  customValidator?: (candidate: string) => boolean;
}): Promise<SynthesizedReview> {
  const start = performance.now();
  const category = options.category || "all";
  const language = options.language || "hinglish";
  const length = options.length || "medium";

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  const categoryFocusMap: Record<ReviewCategory, string> = {
    all: "overall great men's wear collection, polite staff, premium fabric quality, and honest pricing",
    clothes: "great collection of stylish shirts, Armani trousers, trendy t-shirts, and fresh fashion variety",
    staff: "polite, humble, patient staff and helpful customer service",
    quality: "premium fabric quality, breathable cotton, color durability, and rich stitching",
    fitting: "perfect tailored fitting for shirts, Armani trousers, and stretchable jeans",
    pricing: "best value pricing (Shirts 500, Armani 400, Jeans 800, T-Shirts 300, Loafers 500, 20% off undergarments)",
    loafers: "stylish comfortable loafers and rugged designer denim jeans",
    partywear: "classy party wear shirts, festive outfits, and sharp formal Armani trousers",
    offers: "great store deals, combo offers, and flat 20% discount on undergarments",
  };

  const lengthGuideMap: Record<ReviewLength, string> = {
    short: "1 to 2 short crisp lines (18-28 words)",
    medium: "2 to 3 balanced sentences (32-50 words)",
    long: "4 to 5 detailed sentences (60-85 words)",
  };

  const languageInstructionMap: Record<ReviewLanguage, string> = {
    hinglish:
      "Natural Hinglish (Hindi written in English script, conversational Indian customer tone)",
    english: "Natural Indian English (warm, genuine customer tone)",
    marathi:
      "Natural Marathi in Devanagari script (authentic, warm Maharashtrian customer tone)",
  };

  const prompt = `Write a single, natural, authentic 5-star Google review (${lengthGuideMap[length]}) for "MAAAX MENS WEAR" in Khutwad Nagar, Nashik.
Focus mainly on: ${categoryFocusMap[category]}.
Language: ${languageInstructionMap[language]}.
Do NOT use hashtags or quotation marks. Output ONLY the review text.`;

  if (groqKey) {
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
            max_tokens: 180,
          }),
          signal: AbortSignal.timeout(2800),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content
          ?.trim()
          ?.replace(/^["']|["']$/g, "");
        if (text && text.length > 20) {
          const isRejected = options.customValidator
            ? options.customValidator(text)
            : isReviewUsedOrSimilar(
                text,
                options.excludeReviews || [],
                options.usedHashes
              );
          if (!isRejected) {
            return {
              review: text,
              category,
              language,
              length,
              engine: "groq-ai",
              generationTimeMs: Math.round(performance.now() - start),
            };
          }
        }
      }
    } catch {
      // Fallback to in-built synthesizer
    }
  }

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 180 },
          }),
          signal: AbortSignal.timeout(2800),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
          ?.trim()
          ?.replace(/^["']|["']$/g, "");
        if (text && text.length > 20) {
          const isRejected = options.customValidator
            ? options.customValidator(text)
            : isReviewUsedOrSimilar(
                text,
                options.excludeReviews || [],
                options.usedHashes
              );
          if (!isRejected) {
            return {
              review: text,
              category,
              language,
              length,
              engine: "gemini-ai",
              generationTimeMs: Math.round(performance.now() - start),
            };
          }
        }
      }
    } catch {
      // Fallback to in-built synthesizer
    }
  }

  return synthesizeUniqueReview(options);
}
