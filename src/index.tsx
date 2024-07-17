import { Form, ActionPanel, Action, Clipboard } from "@raycast/api";
import { showHUD } from "@raycast/api";
import { useState } from "react";
import { morse } from "./morse";

type Values = {
  textarea: string;
};

export default function Command() {
  const [englishText, setEnglishText] = useState("");
  const [eeeeText, setEeeeText] = useState("");

  const [lengthError, setLengthError] = useState<string | undefined>();

  function dropLengthErrorIfNeeded() {
    if (lengthError && lengthError.length > 0) {
      setLengthError(undefined);
    }
  }
  function validateMessage(value: string): boolean {
    if (value.length > 320) {
      return false;
    } else {
      return true;
    }
  }

  const morseReversed = Object.fromEntries(Object.entries(morse).map(([k, v]) => [v, k]));

  function isEeeee(input: string) {
    return /^[E e]+$/.test(input);
  }

  function toEeeee(english: any) {
    return english
      .split("")
      .map((c: any) => morse[c.toLowerCase()] || "")
      .join(" ")
      .replace(/\./g, "E")
      .replace(/-/g, "e")
      .replace(/ +/g, " ");
  }

  function toEnglish(eeeee: any) {
    return eeeee
      .replace(/E/g, ".")
      .replace(/e/g, "-")
      .split(" ")
      .map((w: any) => morseReversed[w] || "")
      .join("")
      .replace(/ +/g, " ");
  }

  const handleEnglishChange = (value: string) => {
    if (value && !morse[value.substr(-1)]) return false;
    setEnglishText(value);
    setEeeeText(toEeeee(value));
  };

  const handleSteveChange = (value: string) => {
    if (value && !isEeeee(value)) return false;
    setEeeeText(value);
    setEnglishText(toEnglish(value));
    dropLengthErrorIfNeeded();
  };
  async function handleSubmit(values: Values) {
    if (!validateMessage(eeeeText)) {
      setLengthError("Must be under 320 characters");
      return;
    }
    if (eeeeText.trim().length === 0) {
      setLengthError("The field shouldn't be empty!");
      return;
    }

    console.log(values);
    await Clipboard.copy(eeeeText);
    setEeeeText("");
    setEnglishText("");
    showHUD("Copied Translation to Clipboard");
  }

  const charCount = `${eeeeText.length} / 320`;

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="english"
        title="English"
        placeholder="english"
        onChange={(e) => {
          handleEnglishChange(e);
          dropLengthErrorIfNeeded();
        }}
        value={englishText}
      />
      <Form.Separator />
      <Form.TextArea
        id="eeee"
        title="Eeeeeee"
        placeholder="eeeee"
        error={lengthError}
        onChange={(e) => {
          handleSteveChange(e);
          dropLengthErrorIfNeeded();
        }}
        value={eeeeText}
        onBlur={() => {
          if (eeeeText && eeeeText.length > 0) {
            if (!validateMessage(eeeeText)) {
              setLengthError("Must be under 320 characters");
            } else {
              dropLengthErrorIfNeeded();
            }
          } else {
            setLengthError("The field should't be empty!");
          }
        }}
      />
      <Form.Description title="Caracter Limit" text={`${charCount}`} />
    </Form>
  );
}
