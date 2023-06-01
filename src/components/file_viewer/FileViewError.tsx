//this component will be the fallback for when the file loading results in an errro

export default function FileViewError() {
    return (
        <div className="error">
            <h1>File View Error</h1>
            <p>There was an error loading the file.</p>
        </div>
    )
}
