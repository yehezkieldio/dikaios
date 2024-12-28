import { Skeleton } from "@/components/ui/skeleton";

const SuspenseLayout = () => {
    return (
        <div className="min-h-screen bg-background p-4 font-sans">
            <Skeleton className="h-full w-[250px] rounded-xl" />
        </div>
    );
};

export default SuspenseLayout;
