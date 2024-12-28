import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const HomePage = () => {
    return (
        <main className="flex flex-col min-h-screen">
            <div className="flex-1 flex items-center flex-row gap-8 justify-center">
                <div>
                    <h1 className="text-4xl font-bold tracking-wider bg-gradient-to-r from-[#EFF2FF] to-[#BCD2FA] text-transparent bg-clip-text">
                        DIKAIOS
                    </h1>
                    <p className="mt-1 text-sm text-right font-light text-foreground">@yehezkieldio</p>
                </div>
                <div className="flex items-center flex-col gap-4">
                    <a
                        className={cn(
                            buttonVariants({
                                variant: "outline",
                                size: "sm",
                            }),
                            "w-[200px] px-4",
                        )}
                        href="/subnet-mask-reference-table"
                    >
                        Subnet Mask Reference Table
                    </a>
                    <a
                        className={cn(
                            buttonVariants({
                                variant: "outline",
                                size: "sm",
                            }),
                            "w-[200px] px-4",
                        )}
                        href="/ip-calculator"
                    >
                        IP Calculator
                    </a>
                    <a
                        className={cn(
                            buttonVariants({
                                variant: "outline",
                                size: "sm",
                            }),
                            "w-[200px] px-4",
                        )}
                        href="/ip-range-calculator"
                    >
                        IP Range Calculator
                    </a>
                </div>
            </div>
            <footer className="mb-8 text-center font-light text-sm text-muted-foreground">
                In ancient Greek, δίκαιος (dikaios) is an adjective that means "just" or "righteous."
            </footer>
        </main>
    );
};

export default HomePage;
