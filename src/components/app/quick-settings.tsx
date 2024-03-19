import { Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "../theme-switch";

export default function QuickSettings() {
	return (
		<>
			<div className="flex flex-row items-center justify-between gap-2 p-2">
				<div className="flex flex-row items-center gap-2">
					<div className="relative inline-block">
						<img
							src={"https://github.com/tygerxqt.png"}
							alt="Profile Picture"
							className="w-10 h-10 rounded-full"
						/>
						<span className="absolute bottom-0 right-0 border-2 border-transparent w-[10px] h-[10px] bg-green-600 rounded-full"></span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-semibold">{"Ty Mason"}</span>
						<span className="text-xs text-neutral-500 dark:text-neutral-400">
							@{"tygerxqt"}
						</span>
					</div>
				</div>
				<div className="flex flex-row items-center gap-1">
					<ThemeSwitch variant="ghost" />
					<a href="/settings/account">
						<Button variant="ghost" size="icon">
							<Cog size={20} />
						</Button>
					</a>
				</div>
			</div>
		</>
	);
}
