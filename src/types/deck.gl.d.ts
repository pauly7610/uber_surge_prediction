declare module '@deck.gl/react' {
  import * as React from 'react';
  
  interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    [key: string]: any;
  }
  
  interface ViewStateChangeInfo {
    viewState: ViewState;
    interactionState?: any;
    oldViewState?: ViewState;
  }
  
  interface DeckGLProps {
    initialViewState?: ViewState;
    controller?: boolean;
    layers?: any[];
    getTooltip?: (info: any) => string | null;
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
    onViewStateChange?: (info: ViewStateChangeInfo) => void;
  }
  
  export default class DeckGL extends React.Component<DeckGLProps> {}
}

declare module '@deck.gl/aggregation-layers' {
  export class HexagonLayer {
    constructor(props: any);
  }
}

declare module '@deck.gl/layers' {
  export class ScatterplotLayer {
    constructor(props: any);
  }
}

declare module 'react-map-gl/maplibre' {
  import * as React from 'react';
  
  interface MapProps {
    mapLib?: any;
    mapStyle?: string;
    style?: React.CSSProperties;
    reuseMaps?: boolean;
  }
  
  export class Map extends React.Component<MapProps> {}
} 