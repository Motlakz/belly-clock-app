import React from 'react';

const PrivacyPolicy: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const lastUpdated = "August 12, 2024";

    const sections = [
        {
            title: "1. Information We Collect",
            subsections: [
                {
                    subtitle: "1.1 Personal Information",
                    content: "We may collect personal information that you provide directly to us, such as:",
                    list: ["Name", "Email address", "Age", "Gender", "Height and weight", "Fasting goals and preferences"]
                },
                {
                    subtitle: "1.2 Usage Information",
                    content: "We automatically collect certain information about your device and how you interact with our services, including:",
                    list: ["Device type and operating system", "Browser type", "Pages viewed and features used", "Time spent on the site"]
                }
            ]
        },
        {
            title: "2. How We Use Your Information",
            content: "We use the information we collect for various purposes, including:",
            list: [
                "Providing and improving our fasting calculator and related services",
                "Personalizing your experience and offering tailored recommendations",
                "Communicating with you about your account, updates, and promotional offers",
                "Analyzing usage patterns to enhance our website and services",
                "Ensuring the security and integrity of our platform"
            ]
        },
        {
            title: "3. Data Sharing and Disclosure",
            content: "We do not sell your personal information. We may share your information in the following circumstances:",
            list: [
                "With service providers who assist us in operating our website and providing our services",
                "To comply with legal obligations or respond to lawful requests",
                "To protect our rights, privacy, safety, or property"
            ]
        },
        {
            title: "4. Data Security",
            content: "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
        },
        {
            title: "5. Your Rights and Choices",
            content: "You have certain rights regarding your personal information, including:",
            list: [
                "Accessing and updating your information",
                "Requesting deletion of your data",
                "Opting out of marketing communications",
                "Controlling cookies through your browser settings"
            ]
        },
        {
            title: "6. Children's Privacy",
            content: "Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately."
        },
        {
            title: "7. Changes to This Privacy Policy",
            content: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date."
        },
        {
            title: "8. Contact Us",
            content: "If you have any questions or concerns about this Privacy Policy, please contact us at:",
            contact: [
                "Belly Clock",
                "Email: motlalepulasello5@gmail.com"
            ]
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12 mt-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Privacy Policy</h1>
                
                <div className="bg-white shadow-md rounded-lg p-8">
                    <p className="text-sm text-gray-600 mb-6">Last updated: {lastUpdated}</p>
                    
                    <p className="mb-6 text-gray-700 leading-relaxed">At Belly Clock, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our intermittent fasting calculator and related services.</p>
                    
                    {sections.map((section, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{section.title}</h2>
                            {section.content && <p className="mb-4 text-gray-700 leading-relaxed">{section.content}</p>}
                            {section.subsections && section.subsections.map((subsection, subIndex) => (
                                <div key={subIndex} className="mb-4">
                                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{subsection.subtitle}</h3>
                                    <p className="mb-2 text-gray-700 leading-relaxed">{subsection.content}</p>
                                    {subsection.list && (
                                        <ul className="list-disc list-inside mb-4 text-gray-700">
                                            {subsection.list.map((item, i) => (
                                                <li key={i} className="mb-1">{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                            {section.list && (
                                <ul className="list-disc list-inside mb-4 text-gray-700">
                                    {section.list.map((item, i) => (
                                        <li key={i} className="mb-1">{item}</li>
                                    ))}
                                </ul>
                            )}
                            {section.contact && (
                                <div className="text-gray-700">
                                    {section.contact.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <p className="mt-8 text-sm text-center text-gray-600">
                    &copy; {currentYear} Belly Clock - Free Fasting Calculator. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
