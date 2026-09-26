import background from './assets/ui/background.png';
import panelShadows from './assets/ui/panel-shadows.png';
import titleBar from './assets/ui/title-bar.png';
import panels from './assets/ui/panels.png';
import bottomLine from './assets/ui/bottom-line.png';

/**
 * The user's 1120×800 source art stays in separate, transparent layers.
 * It is decoration only; controls remain ordinary DOM elements above it.
 */
export function PngSkin() {
  return <div className="png-skin" aria-hidden="true">
    <img src={background} alt="" className="png-skin-background" />
    <img src={panelShadows} alt="" className="png-skin-panel-shadows" />
    <img src={titleBar} alt="" />
    <img src={panels} alt="" />
    <img src={bottomLine} alt="" />
  </div>;
}
