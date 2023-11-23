import cx from "classnames"
import { X } from "react-bootstrap-icons"

const SlidePanel = ({ isShow, title, children }) => {
  return (
    <div className={cx("slide-panel", isShow && "active")}>
      <div className="slide-panel-header">
        <X />
        <div>{title}</div>
      </div>
      <div className="slide-panel-content">
        {children}
      </div>
    </div>
  )
}

export default SlidePanel