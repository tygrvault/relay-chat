import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DirectMessage } from "@/types/message";
import { FilePlusIcon, Pin, SendHorizontalIcon } from "lucide-react";
import { makeLoader, useLoaderData } from "react-router-typesafe";
import { useEffect, useState } from "react";
import User from "@/types/user";
import pb from "@/lib/pocketbase"
import { toast } from "sonner";
import Message from "@/components/chat/message";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DirectMessagePage() {
    const { recipient, messages } = useLoaderData<typeof loader>();

    const [msg, setMsg] = useState("");
    const [msgs, setMsgs] = useState<DirectMessage[]>(messages.items);

    const onMessageSubmit = async () => {
        if (!msg) {
            return;
        }

        await pb.collection<DirectMessage>("direct_messages").create({
            recipient: recipient.id,
            author: pb.authStore.model?.id,
            content: msg
        }, { expand: "author" }).then((res) => {
            console.log(res);
            setMsgs([...msgs, res]);
            setMsg("");
        }).catch((err) => {
            toast.error(err.message);
        })
    }

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                await onMessageSubmit();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [msg]);

    return (
        <>

            {recipient && (
                <>
                    <main className="flex flex-col gap-2 min-h-screen h-screen w-full">
                        <div className="w-full p-2 border-b border-black/10 dark:border-white/10">
                            <div className="flex flex-row gap-2 items-center justify-between">
                                <div className="flex flex-row gap-2 items-center">
                                    <img src={`${import.meta.env.VITE_AUTH_URL}/api/files/_pb_users_auth_/${recipient.id}/${recipient.avatar}`} alt={recipient.username} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium">
                                        {recipient.username}
                                    </span>
                                </div>
                                <Tooltip delayDuration={150}>
                                    <TooltipTrigger>
                                        <Button size="icon" variant="ghost">
                                            <Pin fill="currentColor" size={24} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Pinned Messages
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <ScrollArea className="h-full flex flex-col w-full grow">
                            {msgs.length <= 0 ? (
                                <>
                                    <div className="flex flex-col justify-center items-center w-full h-full">
                                        <span className="text-medium">No messages yet</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {msgs.map((msg) => {
                                        return (
                                            <Message msg={msg} />
                                        )
                                    })}
                                </>
                            )}
                        </ScrollArea>
                        <div className="flex flex-row gap-2 p-2 border-t border-black/10 dark:border-white/10 w-full">
                            <div className="flex flex-row items-center border rounded-md gap-2 w-full h-full">
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger>
                                        <Button variant="ghost" size="icon">
                                            <FilePlusIcon size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Attach Files
                                    </TooltipContent>
                                </Tooltip>
                                <input className="w-full max-h-32 bg-neutral-50 dark:bg-neutral-950 focus:outline-none text-pretty" value={msg} onChange={(e) => setMsg(e.target.value)} />
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger>
                                        <Button variant="ghost" size="icon" onClick={async () => await onMessageSubmit()}>
                                            <SendHorizontalIcon size={18} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Send
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </main>
                </>
            )}
        </>
    )
}

export const loader = makeLoader(async ({ params }) => {
    if (params.id === undefined) {
        throw new Error("Invalid user ID");
    }

    const user = await pb.collection<User>("users").getOne(pb.authStore.model?.id, {
        expand: "friends"
    });

    const recipient = await pb.collection<User>("users").getOne(params.id, {
        expand: "friends"
    });

    if (user.friends.length <= 0) {
        throw new Error("You have no friends. Make sure you add friends to send direct messages.")
    }

    if (user.friends.length = 0 && !user.expand.friends?.map(f => f.id).includes(params.id)) {
        throw new Error("You and the recipient are not friends. Make sure you both add each other as friends to send direct messages.");
    }

    const messages = await pb.collection<DirectMessage>("direct_messages").getList(1, 50, {
        filter: `recipient.id = "${params.id}"`,
        expand: "author"
    });

    console.log(messages)

    return {
        recipient,
        messages
    }
});