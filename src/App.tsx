import {
    createEffect,
    createSignal,
    For,
    type Accessor,
} from "solid-js";
import sample from "lodash/sample";

const roles = ["blind", "deaf", "mute", "ludite"] as const;
type Role = (typeof roles)[number];
const generateRandomRole = (): Role => sample(roles);
const generateNewRole = (previous: string | undefined): Role =>
    sample(roles.filter((v) => v !== previous))!;

type PlayerListHook = {
    players: Accessor<string[]>;
    addPlayer: (name: string) => void;
    removePlayer: (name: string) => void;
};

const usePlayerList = (): PlayerListHook => {
    const json = localStorage.getItem("players") ?? "[]";
    const [players, setPlayers] = createSignal<string[]>(JSON.parse(json));

    const save = () => {
        localStorage.setItem("players", JSON.stringify(players()));
    };

    const addPlayer = (name: string) => {
        if (players().includes(name)) return;
        setPlayers([...players(), name]);
        save();
    };
    const removePlayer = (name: string) => {
        const newPlayers = players().filter((v) => v !== name);
        setPlayers(newPlayers);
        save();
    };

    return { players, addPlayer, removePlayer };
};

type RoleAssigned = {
    name: string;
    role: Role;
};
const useAssignedRoles = (
    players: Accessor<string[]>,
): { reroll: () => void; playerRoles: Accessor<RoleAssigned[]> } => {
    let assignedRoles: Record<string, Role> = {};

    const generateRoles = (players: string[]): RoleAssigned[] => {
        return players.map((name) => {
            if (name in assignedRoles) {
                const role = assignedRoles[name];
                return { name, role };
            } else {
                const role = generateRandomRole();
                assignedRoles[name] = role;
                return { name, role };
            }
        });
    };

    const [playerRoles, setPlayerRoles] = createSignal<RoleAssigned[]>(generateRoles(players()));

    const reroll = () => {
        const previousRoles = { ...assignedRoles };
        const newRoles = players().map((name) => {
            const previousRole = previousRoles[name];
            const role = generateNewRole(previousRole);
            assignedRoles[name] = role;
            return { name, role };
        });
        setPlayerRoles(newRoles);
    };

    createEffect(() => {
        setPlayerRoles(generateRoles(players()));
    });

    return { playerRoles, reroll };
};

function App() {
    const { addPlayer, players, removePlayer } = usePlayerList();
    const { playerRoles, reroll } = useAssignedRoles(players);

    return (
        <div class="size-full flex justify-center items-center">
            <div class="h-fit flex gap-8 justify-around items-center py-16">
                <div class="h-128 flex flex-col gap-4">
                    <RoleCard
                        title="Blind"
                        description="Turn your gamma to 12 in graphics settings"
                    />
                    <RoleCard
                        title="Deaf"
                        description="Turn your ingame volume to 0% in the settings"
                    />
                    <RoleCard
                        title="Mute"
                        description="Set your mic to push to talk and rebind the key to something you won't press"
                    />
                    <RoleCard
                        title="Ludite"
                        description="Type /cinematic in chat to turn off your HUD"
                    />
                </div>
                <div class="h-128 flex flex-col items-stretch gap-2">
                    <div class="flex flex-col gap-2 flex-1">
                        <For each={playerRoles()}>
                            {({ name, role }) => (
                                <div
                                    class="hover:italic hover:underline w-fit capitalize text-xl cursor-pointer"
                                    onClick={() => removePlayer(name)}
                                >
                                    {name}: {role}
                                </div>
                            )}
                        </For>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.querySelector("input")!;
                            if (input.value === "") return;
                            addPlayer(input.value);
                            input.value = "";
                        }}
                        class="flex items-center gap-4"
                    >
                        <input class="bg-[#202020] h-8 px-2 rounded-md outline-none" name="name" />
                        <button
                            class="bg-[#202020] px-4 py-1 h-8 rounded-md cursor-pointer "
                            type="submit"
                        >
                            Add Player
                        </button>
                    </form>
                    <button
                        class="bg-[#202020] px-4 py-2 h-fit rounded-md cursor-pointer w-full "
                        onClick={() => reroll()}
                    >
                        Reroll
                    </button>
                </div>
            </div>
        </div>
    );
}

const RoleCard = ({ title, description }: { title: string; description: string }) => (
    <div class="bg-[#202020] w-96 rounded-lg py-3 px-5 flex flex-col justify-center gap-2 flex-1">
        <h2 class="w-full text-2xl font-bold">{title}</h2>
        <p>{description}</p>
    </div>
);
export default App;
