let latest_flags = undefined;
const buffer = [];

function run_dynamic_macro() {
    // const KEY_A = 0; // TODO: expose this style keycodes from rust world
    // send_keyboard_event(KEY_A, 0, true);

    const size = checkRepeat(buffer);

    if (size !== null) {
        // TODO make builtin functions lowerCamelCase
        send_flags_changed_event(kCGEventFlagMaskNonCoalesced);

        const front = buffer.slice(0, size);
        for (const keyState of front.reverse()) {
            send_keyboard_event(keyState[0], keyState[1], true);
        }

        send_flags_changed_event(latest_flags);
    } else {
        console.warn("No repeats!!!: " + JSON.stringify(buffer));
    }
}

function checkRepeat(buffer) {
    for (let size = buffer.length / 2; size >= 1; size--) {
        let front = buffer.slice(0, size);
        let rear = buffer.slice(size, size * 2);
        // console.log("front=" + front + " rear=" + rear);
        if (JSON.stringify(front) === JSON.stringify(rear)) {
            return size;
        }
    }
    return null;
}

register_plugin(
    "com.github.tokuhirom.onemoretime.dynamicmacro",
    "One more time",
    function (event, config) {
        if (event.type === "flags_changed") {
            latest_flags = event.flags;
        } else if (event.type === "keydown") {
            // TODO config.hotkey.matches(latest_flags, keycode)
            if (matches_hotkey_string(latest_flags, event.keycode, "C-j")) {
                run_dynamic_macro();
                return false;
            }

            buffer.unshift([event.keycode, latest_flags]);
            if (buffer.length > 6) {
                buffer.pop();
            }
        }
        console.log(`event detected :::${JSON.stringify(event)}, ${latest_flags}`);

        return true; // send event to the normal destination
    },
    [
        {
            "name": "hotkey",
            "type": "hotkey",
            "default": "C-t"
        }
    ]
);