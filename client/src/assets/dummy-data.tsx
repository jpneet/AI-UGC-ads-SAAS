import { UploadIcon, VideoIcon, ZapIcon } from 'lucide-react';

export const featuresData = [
    {
        icon: <UploadIcon className="w-6 h-6" />,
        title: 'Smart Upload',
        desc:  'Drag & drop your assets. We auto-optimzed formats and sizes.'
    },
    {
        icon: <ZapIcon className="w-6 h-6" />,
        title: 'Instant Generation',
        desc: 'Optimized models deliver output in seconds with great fidelity'
    },
    {
        icon: <VideoIcon className="w-6 h-6" />,
        title: 'Video Synthesis',
        desc: 'Bring product shots to life with short-form,social-ready videos'
    }
];

export const plansData = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$10',
        desc: 'Try the Plateform at no cost.',
        credits: 25,
        features: [
            '25 credits',
            'Standard quality',
            'No Watermark',
            'Slower generation speed',
            'Email support'
        ]
    },
    {
        id: 'pro',
        name: 'pro',
        price: '$29',
        desc: 'Creators and small Teams',
        credits: 80,
        features: [
            "80 credits",
            "HD / Ultra quality video output",
            "Advanced AI video models",
            "Priority email & chat support",
            "Early access to new features"
        ],
        popular: true
    },
    {
        id: 'ultra',
        name: 'ultra',
        price: '$99',
        desc: 'Scale across teams and agecies',
        credits: 300,
        features: [
            '300 credits',
            'FHD quality',
            'No watermark',
            'Fast generation speed',
            'Chat + Email support'
        ]
    }
];

export const faqData = [
    {
        question: 'What does "model" mean in AI video generation?',
        answer: 'A model is the underlying AI system that defines how your video is generated — including motion style, realism level, visual aesthetics and rendering behavior.'
    },
    {
        question: 'What is an "object" in a video prompt?',
        answer: 'An object refers to the subject or scene you want the AI to generate, such as a person, character, environment or action inside the video.'
    },
    {
        question: 'How long does it take to generate a video?',
        answer: 'Generation time depends on the selected model and complexity of the object prompt, but most videos are created within a few seconds to a couple of minutes.'
    },
    {
        question: 'Can I refine or regenerate a video after creation?',
        answer: 'Yes. You can adjust the model settings or modify the object prompt to regenerate improved or alternative versions of your video.'
    }
];

export const footerLinks = [
    {
        title: "Quick Links",
        links: [
            { name: "Home", url: "#" },
            { name: "Features", url: "#" },
            { name: "Pricing", url: "#" },
            { name: "FAQ", url: "#" }
        ]
    },
    {
        title: "Legal",
        links: [
            { name: "Privacy Policy", url: "#" },
            { name: "Terms of Service", url: "#" }
        ]
    },
    {
        title: "Connect",
        links: [
            { name: "Twitter", url: "#" },
            { name: "LinkedIn", url: "#" },
            { name: "GitHub", url: "#" }
        ]
    }
];