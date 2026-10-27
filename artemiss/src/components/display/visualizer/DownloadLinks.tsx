import { Button, Tooltip } from '@mui/material'
import { KnownPathType } from '@snTypes/DataDictionary'
import makeResourcePath from "@snUtil/makeResourcePath"
import { FunctionComponent } from "react"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python"
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs"

type Props = {
    canonicalPath: string
}

SyntaxHighlighter.registerLanguage('python', python)


const DownloadLinks: FunctionComponent<Props> = (props: Props) => {
    const { canonicalPath } = props
    
    const vmecInPath = makeResourcePath(canonicalPath, KnownPathType.VMEC_IN)
    const vmecOutPath = makeResourcePath(canonicalPath, KnownPathType.VMEC_OUT)
    
    // We have to do some fussy path-munging in order to construct the forced-download link correctly--otherwise
    // the browser will suggest saving the file according to its full path, not just its file name.
    const vmecInPathParts = vmecInPath.split("/")
    const vmecInFile = vmecInPathParts.pop() ?? ""
    const vmecPathFinal = vmecInPathParts.join("/")
    const vmecOutPathParts = vmecOutPath.split("/")
    const vmecOutFile = vmecOutPathParts.pop() ?? ""
    const vmecOutPathFinal = vmecOutPathParts.join("/")
    console.log(`vmec in path has ${vmecInPathParts} -- ${vmecInFile} -- ${vmecPathFinal}`)

    const codeSnippet =
`from simsopt._core import load
[surfaces, coils] = load('foo')`
// // // [surfaces, coils] = load('${simsoptFile}')`

    return  (<div className="indent">
                <Tooltip
                    title="Download VMEC input file"
                >
                    <Button
                        variant="contained"
                        size="small"
                        style={{margin: 20}}
                        onClick={() => document.getElementById("vmec_in_download")?.click()}
                    >
                        Download VMEC Input
                    </Button>
                </Tooltip>
                <a id="vmec_in_download" href={`${vmecPathFinal}/${vmecInFile}`} download={vmecInFile} style={{display: "none"}} />
                <Tooltip
                    title="Download VMEC wout file"
                >
                    <Button
                        variant="contained"
                        size="small"
                        style={{margin: 20}}
                        onClick={() => document.getElementById("vemc_wout_download")?.click()}
                    >
                        Download VMEC Wout
                    </Button>
                </Tooltip>
                <a id="vemc_wout_download" href={`${vmecOutPathFinal}/${vmecOutFile}`} download={vmecOutFile} style={{display: "none"}} />
                <div>
                    <span>To load downloaded SIMSOPT data, execute the following Python script:</span>
                    <div style={{border: "1px solid #7f7f7f", margin: 10}}>
                        <SyntaxHighlighter language="python" style={a11yLight}>
                            {codeSnippet} 
                        </SyntaxHighlighter>
                    </div>
                </div>
            </div>)
}

export default DownloadLinks
