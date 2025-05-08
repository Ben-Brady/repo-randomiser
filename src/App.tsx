import { createSignal, Show, type ComponentProps } from "solid-js";
import sample from "lodash/sample";

const roles = ["blind", "deaf", "mute", "ludite"] as const;
type Role = (typeof roles)[number];
const generateRandomRole = (): Role => sample(roles);

function App() {
    const [role, setRole] = createSignal<Role>(generateRandomRole());

    return (
        <div class="size-full flex flex-col justify-center items-center gap-4 px-4">
            <div class="bg-[#202020] rounded-lg py-3 px-5 flex flex-col gap-2">
                <Show when={role() === "blind"}>
                    <Title>Blind</Title>
                    <p>Turn your gamma to 12 in graphics settings</p>
                </Show>
                <Show when={role() === "deaf"}>
                    <Title>Deaf</Title>
                    <p>Turn your ingame volume to 0% in the settings</p>
                </Show>
                <Show when={role() === "mute"}>
                    <Title>Mute</Title>
                    <p>
                        Set your mic to push to talk and rebind the key to something you won't press
                    </p>
                </Show>
                <Show when={role() === "ludite"}>
                    <Title>Ludite</Title>
                    <p>Type /cinematic in chat to turn off your HUD</p>
                </Show>
            </div>
            <button class="h-fit" onClick={() => setRole(generateRandomRole())}>
                Generate New Role
            </button>
        </div>
    );
}

const Title = (props: ComponentProps<"div">) => (
    <h2 {...props} class="w-full text-center text-2xl font-bold" />
);
export default App;
