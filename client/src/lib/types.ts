export type ComponentType = 'container' | 'text' | 'button' | 'image' | 'card' | 'navbar' | 'link' | 'footer' | 'section';

export interface ComponentProps {
  [key: string]: any;
  text?: string;
  color?: string;
  backgroundColor?: string;
  src?: string;
  href?: string;
  padding?: string;
  borderRadius?: string;
  label?: string;
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
