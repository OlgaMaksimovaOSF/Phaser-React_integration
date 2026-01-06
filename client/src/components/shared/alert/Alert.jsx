
const Alert = (props) => {
    return (
        <div className="pos-fixed pos-tc alert">
            {props.msg && props.msg}
            {props.children && props.children}
        </div>
    )
}

export default Alert;