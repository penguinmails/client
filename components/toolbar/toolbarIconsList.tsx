/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redo2, Undo2, Bold, Italic, Underline, Link2, AlignLeft, AlignRight, AlignCenter, Quote, List, ListOrdered, Type, Code, Image as ImageIcon } from 'lucide-react';
import { ComponentType } from "react";

export const eventTypes = {
  paragraph: "paragraph",
  h1: "h1",
  h2: "h2",
  ul: "ul",
  ol: "ol",
  quote: "quote",
  formatCode: "formatCode",
  formatUndo: "formatUndo",
  formatRedo: "formatRedo",
  formatBold: "formatBold",
  formatItalic: "formatItalic",
  formatUnderline: "formatUnderline",
  formatStrike: "formatStrike",
  formatInsertLink: "formatInsertLink",
  formatAlignLeft: "formatAlignLeft",
  formatAlignCenter: "formatAlignCenter",
  formatAlignRight: "formatAlignRight",
  insertImage: "insertImage",
} as const;

export type EventType = typeof eventTypes[keyof typeof eventTypes];

export interface PluginItem {
  id: number;
  Icon: ComponentType<any>;
  event: EventType;
}

const pluginsList: PluginItem[] = [
  {
    id: 1,
    Icon: Type,
    event: eventTypes.paragraph,
  },
  {
    id: 2,
    Icon: () => <span style={{ fontWeight: 'bold' }}>H1</span>,
    event: eventTypes.h1,
  },
  {
    id: 3,
    Icon: () => <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>H2</span>,
    event: eventTypes.h2,
  },
  {
    id: 4,
    Icon: List,
    event: eventTypes.ul,
  },
  {
    id: 5,
    Icon: ListOrdered,
    event: eventTypes.ol,
  },
  {
    id: 6,
    Icon: Quote,
    event: eventTypes.quote,
  },
  {
    id: 7,
    Icon: Code,
    event: eventTypes.formatCode,
  },
  {
    id: 8,
    Icon: Undo2,
    event: eventTypes.formatUndo,
  },
  {
    id: 9,
    Icon: Redo2,
    event: eventTypes.formatRedo,
  },
  {
    id: 10,
    Icon: Bold,
    event: eventTypes.formatBold,
  },
  {
    id: 11,
    Icon: Italic,
    event: eventTypes.formatItalic,
  },
  {
    id: 12,
    Icon: Underline,
    event: eventTypes.formatUnderline,
  },
  // { // reactive it if you need it
  //   id: 13,
  //   Icon: () => <span style={{ textDecoration: 'line-through' }}>S</span>,
  //   event: eventTypes.formatStrike,
  // },
  {
    id: 13,
    Icon: ImageIcon,
    event: eventTypes.insertImage,
  },
  {
    id: 14,
    Icon: Link2,
    event: eventTypes.formatInsertLink,
  },
  {
    id: 15,
    Icon: AlignLeft,
    event: eventTypes.formatAlignLeft,
  },
  {
    id: 16,
    Icon: AlignCenter,
    event: eventTypes.formatAlignCenter,
  },
  {
    id: 17,
    Icon: AlignRight,
    event: eventTypes.formatAlignRight,
  },
];

export default pluginsList;
