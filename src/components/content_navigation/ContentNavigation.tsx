//this component will give back breadcrumb navigation of rocrate
import { Breadcrumb } from "react-bootstrap";
import { AiFillHome } from "react-icons/ai";

export default function ContentNavigation(props: any) {
    const loading = props.loading;
    const hash = props.hash;
    let hash_array = hash.split("/");
    //remove the # from the first element of the array
    hash_array[0] = hash_array[0].replace("#", "");
    const hash_array_length = hash_array.length;

    return (
        loading ? 
        <></> 
        :
        hash ? 
        <Breadcrumb>
            {hash_array_length == 2 ?
                <Breadcrumb.Item active href=""><AiFillHome className="accent-color"/></Breadcrumb.Item>
                :
                hash_array.map((item: any, index: number) => {
                    if (index == 0) {
                        return (
                            <Breadcrumb.Item href={"#./"}><AiFillHome className="accent-color"/></Breadcrumb.Item>
                        )
                    }
                    if (index == hash_array_length -1 || item.length == 0) {
                        return (
                            <Breadcrumb.Item active className="accent-color">{item}</Breadcrumb.Item>
                        )
                    }
                    else {
                        return (
                            <Breadcrumb.Item href={"#" + hash_array.slice(0, index + 1).join("/") + "/"} className="accent-color">{item}</Breadcrumb.Item>
                        )
                    }
                })
            }
        </Breadcrumb>
        : 
        <></>
    )
}