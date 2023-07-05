//this component will be the footer 

export default function Footer(props: any) {
    //the empty p tag is to make sure the footer is at the bottom of the page
    const reponame = props.reponame;
    return (
        <div className="footer">
            <p></p>
            <p>Created from 
                <a href="https://github.com/vliz-be-opsci/rocrate-to-pages"> rocrate-to-pages </a> 
                by 
                <a href="https://open-science.vliz.be/" target="_blank">
                    <img src="https://open-science.vliz.be/img/VLIZ_LOGO.svg" alt="@vliz-be-opsci" className="footer_logo"/>
                </a>
                with data 
                <a href={"https://github.com/"+reponame} target="_blank">
                    <img src="https://open-science.vliz.be/img/github-logo.svg" alt="data-location" className="footer_logo"/>
                </a>
            </p>
            <p>
                <a href="./ro-crate-metadata.json">
                    <img src="https://open-science.vliz.be/img/rdf-logo.svg" alt="ro-crate-metadata.json" className="footer_logo"/>
                </a>
            </p>
        </div>
    )
}
