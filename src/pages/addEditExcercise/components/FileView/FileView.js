
import { Button, DialogActions, DialogContent, DialogTitle, Paper, Typography } from '@material-ui/core'
import React from 'react'
import { useDrag } from 'react-dnd'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { useTheme } from '@material-ui/styles';
import DeleteAlertDialog from '../../../../components/Dialogs/DeleteAlertDialog/DeleteAlertDialog';
import { useDialog } from '../../../../context/DialogProvider';
import { Trans } from '@lingui/macro';

import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { forwardRef } from 'react';
import VideoPlayer from '../VideoPlayer/VideoPlayer';


/**
 * Your Component
 */



export default function FileView({ file, type, fileCount, onSwapUp, onSwapDown, onDelete, ...props }) {

    // console.log("file is ", file)

    var theme = useTheme();

    const [openDialog, closeDialog] = useDialog();
    const onOpenDialog = () => {
        openDialog({
            children: (
                <>
                    <DialogTitle><Trans>Delete image?</Trans></DialogTitle>
                    <DialogContent><Trans>Are you sure? this action will not be saved before submiting</Trans></DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={(e) => { closeDialog(); onDelete(file) }}> <Trans>Delete</Trans> </Button>
                        <Button onClick={closeDialog} color="primary" >
                            <Trans>Dont Delete</Trans>    </Button>
                    </DialogActions>
                </>
            )
        });
    };


    function onDeleteClicked(e) {
        // e.stopPropagation();
        console.log("delete clicked")
        // setDialogOpen(true)
        onOpenDialog()

    }
    const videoJsOptions = {
        autoplay: false,
        controls: true,
        sources: [{
            src: file.url,
            type: file.type
        }],
        responsive: true
    }

    return (
        <>
            <Paper ref={props.ref} elevation={4} style={

                {
                    minWidth: 300, maxWidth: 600, minHeight: 100, maxHeight: 200, border: "solid", borderRadius: 4, borderWidth: 2,
                    display: "flex", flexDirection: "row-reverse", marginTop: 20

                }}
                onClick={e => e.stopPropagation()}

            >
                {type === "image" &&

                    <img src={file.url} alt={file.fieldName} />

                }
                {type === "video" &&

                    <VideoPlayer
                        {...videoJsOptions}  />
                }

                <div style={{
                    display: "flex", flexDirection: "row", justifyContent: "center", "alignItems": "center", flexGrow: 1
                }}>
                    <ArrowUpwardIcon style={{
                        width: 50, height: 50, marginTop: 4, alignSelf: "center", color: theme.palette.primary.main,
                        visibility: file.order === 0 ? "hidden" : "visible",

                    }}

                        onClick={e => onSwapUp(file)}
                    />
                    <div style={{ display: "flex", minHeight: 100, maxHeight: 200, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>

                        {/* <Typography  >{file.order}</Typography> */}
                        <Typography style={{
                            borderRadius: "50%", width: 30, height: 30, display: "flex", border: "1px black solid", alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: theme.palette.primary.light,
                            color: "white"
                        }} >{file.order}</Typography>

                        <DeleteForeverIcon style={{ width: 50, height: 50, marginTop: 4, color: theme.palette.delete.light }}

                            onClick={e => onDeleteClicked(e)}
                        />
                    </div>
                    <ArrowDownwardIcon style={{
                        width: 50, height: 50, marginTop: 4, alignSelf: "center", color: theme.palette.primary.main
                        , visibility: file.order === fileCount - 1 ? "hidden" : "visible"

                    }}

                        onClick={e => onSwapDown(file)}
                    />

                </div>

            </Paper >

        </>
    )
}