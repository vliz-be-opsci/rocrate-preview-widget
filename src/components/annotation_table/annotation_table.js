//this component will display the annotations in a table wit a link to the respective schema.org page

const AnnotationTable = (props) => {
    //get the annotations for the current object selected
    const annotations = props.annotations;
    console.log(annotations);

    try {
        return (
            <div className="File-content-panel Annotations display-none">
                <table>
                    <thead>
                        <tr>
                            <th>Annotation</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(annotations).map((key) => {
                            return (
                                <tr>
                                    <td>{key}</td>
                                    <td>{annotations[key]}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    } catch (error) {
        return(<></>)
    }
}

export default AnnotationTable;
