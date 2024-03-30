import EditorJS, {
  type OutputData,
  type API,
  type BlockMutationEvent,
} from "@editorjs/editorjs";
import Quote from "@editorjs/quote";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import SimpleImage from "@editorjs/simple-image";
import { useEffect, useId, useRef } from "react";

type Props = {
  onChange: (
    api: API,
    event: BlockMutationEvent | BlockMutationEvent[]
  ) => void;
  data?: OutputData;
};

export default function RichText({ data, onChange }: Props) {
  const id = useId();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      new EditorJS({
        holder: id,
        tools: {
          quote: {
            class: Quote,
            config: {
              quotePlaceholder: "Enter a quote",
              captionPlaceholder: "Quote's author",
            },
          },
          header: Header,
          image: SimpleImage,
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
        },
        placeholder: "Start typing.....",
        onChange,
        data,
      });
    }
  }, []);

  return <div id={id} className="bg-default-100 rounded-medium py-3.5"></div>;
}
