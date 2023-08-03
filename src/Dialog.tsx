import { Layer, LayerExtendedProps } from "grommet";

export interface DialogProps extends LayerExtendedProps {
  visible: boolean
}

export const Dialog = ({ visible, children, ...props }: DialogProps) => {
  return visible ? <Layer {...props}>{children}</Layer> : <></>
}