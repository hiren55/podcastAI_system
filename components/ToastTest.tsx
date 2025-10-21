'use client';

import { useToast, toastSuccess, toastError, toastWarning, toastInfo } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function ToastTest() {
    const { toast } = useToast();

    const testToasts = () => {
        // Test different toast types
        toastSuccess({
            title: "🎉 Success!",
            description: "This is a success message"
        });

        setTimeout(() => {
            toastError({
                title: "❌ Error",
                description: "This is an error message"
            });
        }, 1000);

        setTimeout(() => {
            toastWarning({
                title: "⚠️ Warning",
                description: "This is a warning message"
            });
        }, 2000);

        setTimeout(() => {
            toastInfo({
                title: "ℹ️ Info",
                description: "This is an info message"
            });
        }, 3000);

        setTimeout(() => {
            toast({
                title: "🔔 Default",
                description: "This is a default message"
            });
        }, 4000);
    };

    return (
        <div className="p-8 space-y-4">
            {/* <h2 className="text-2xl font-bold ai-gradient-text">Toast Test</h2>
            <Button onClick={testToasts} className="btn-ai-neon">
                Test All Toasts
            </Button> */}
        </div>
    );
}
