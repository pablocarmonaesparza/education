export { AppleActionChip } from "./AppleActionChip";
export type { AppleActionChipProps, AppleChipStyle } from "./AppleActionChip";
export { AppleAttachmentCard } from "./AppleAttachmentCard";
export type { AppleAttachmentCardProps, AppleFileKind } from "./AppleAttachmentCard";
export { AppleBadge } from "./AppleBadge";
export { AppleButton } from "./AppleButton";
export { AppleButtonLink } from "./AppleButtonLink";
export { AppleCard, AppleCardBody, AppleCardFooter, AppleCardHeader } from "./AppleCard";
export { AppleCaseHeader } from "./AppleCaseHeader";
export type { AppleCaseHeaderProps } from "./AppleCaseHeader";
export { AppleCheckbox } from "./AppleCheckbox";
export { AppleDataTable } from "./AppleDataTable";
export type { AppleDataTableColumn, AppleDataTableProps } from "./AppleDataTable";
export { AppleDivider } from "./AppleDivider";
export type { AppleDividerProps } from "./AppleDivider";
export { AppleEmptyState } from "./AppleEmptyState";
export { AppleErrorState } from "./AppleErrorState";
export { AppleIcon } from "./AppleIcon";
export { AppleKpiCard } from "./AppleKpiCard";
export type { AppleKpiCardProps, AppleKpiDirection } from "./AppleKpiCard";
export type { AppleIconName, AppleIconSize } from "./AppleIcon";
export { AppleInput, AppleSelect, AppleTextarea } from "./AppleInput";
export { AppleLink } from "./AppleLink";
export { AppleMessageCard } from "./AppleMessageCard";
export type { AppleMessageCardProps, AppleMessageChannel } from "./AppleMessageCard";
export {
  AppleModal,
  AppleModalBody,
  AppleModalContent,
  AppleModalFooter,
  AppleModalHeader,
} from "./AppleModal";
export { AppleProgress } from "./AppleProgress";
export { AppleReveal } from "./AppleReveal";
export type { AppleRevealProps } from "./AppleReveal";
export { AppleSidebar } from "./AppleSidebar";
export type { AppleSidebarItem } from "./AppleSidebar";
export { AppleSkeleton } from "./AppleSkeleton";
export { AppleSlider } from "./AppleSlider";
// AppleSlideBody NO se exporta desde el barrel: arrastra react-markdown +
// remark-gfm a todo consumidor del index. Importarlo deep:
// `@/components/simulador/apple/AppleSlideBody`.
export { AppleSlideButton } from "./AppleSlideButton";
export { AppleSortableList } from "./AppleSortableList";
export type { AppleSortableListProps } from "./AppleSortableList";
export { AppleStepBar } from "./AppleStepBar";
export { AppleStepDots } from "./AppleStepDots";
export type { AppleStepDot } from "./AppleStepDots";
export { AppleSwitch } from "./AppleSwitch";
export type { AppleSwitchProps } from "./AppleSwitch";
export { AppleTabs } from "./AppleTabs";
export { AppleTimeline } from "./AppleTimeline";
export type { AppleTimelineEvent } from "./AppleTimeline";
export type { AppleTabItem } from "./AppleTabs";
export { AppleToast } from "./AppleToast";
// Primitivos de formulario/selección del exercise lab (nombres sin prefijo
// Apple a propósito: preservan la API que ya consumen los bloques).
export {
  Label,
  ChoiceButton,
  GuidedOption,
  GuidedInputCard,
  GuidedSlideOptions,
  Range10,
  ProcessAnswer,
  CompareCard,
  AgentBriefLine,
} from "./AppleExercisePrimitives";
export { cn } from "./utils";
