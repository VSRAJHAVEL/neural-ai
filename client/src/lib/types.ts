export type ComponentType = 'container' | 'text' | 'button' | 'image' | 'card' | 'navbar';

export interface ComponentProps {
  [key: string]: any;
  text?: string;
  color?: string;
  backgroundColor?: string;
  src?: string;
  href?: string;
  padding?: string;
  borderRadius?: string;
}

export interface Component {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: Component[]; // For containers
}

export interface Layout {
  components: Component[];
}
