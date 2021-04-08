import React, { useEffect, useState } from "react";
import {
    Grid,
    LinearProgress,
    Select,
    OutlinedInput,
    MenuItem,
    Button,
    Paper,
    Tabs,
    Tab,
    Card,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import { useTheme } from "@material-ui/styles";

import PageTitle from "../../components/PageTitle/PageTitle";
import { Typography } from "../../components/Wrappers/Wrappers";

import useStyles from "./styles";
import { Trans } from "@lingui/macro";
import { Fragment } from "react";
import { t } from '@lingui/macro';
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CreatePatient, GetAllExercises, GetMyPatients } from "../../api/queries";
import { useLocation } from "react-router";
import { useAPIContext } from "../../context/APIContext";

export default function PatientsPage(props) {
    var classes = useStyles();
    var theme = useTheme();
    var userInput = { Type: "Patient", patient: {} }
    const [value, setValue] = React.useState(1);

    const [createUser, createUserRes] = useMutation(CreatePatient)
    const myPatientsRes = useQuery(GetMyPatients)

    const location = useLocation()

    // const [getAllExercises, getAllExercisesState] = useLazyQuery(GetAllExercises)

    // const apiContext = useAPIContext()


    console.log("my patients", myPatientsRes)


    const [openDialog, setOpenDialog] = React.useState(false);

    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
    };

    const handleUserInput = (e) => {
        const param = e.target.id
        const value = e.target.value
        userInput[param] = value

        console.log(userInput)
    }

    const handlePatientInfo = (e) => {
        const param = e.target.id
        const value = e.target.value

        userInput.patient[param] = value
        console.log(userInput)

    }

    const sendCreatePatientReq = () => {

        createUser({
            variables: {
                userInput: userInput
            }
        })
    }

    // const filterFunction = (e) => {
    //     var query = e.target.value
    //     console.log('query is', query)
    //     if (query === "") {
    //         setExercises(apiContext.state.exercises)
    //     } else {
    //         setExercises(apiContext.state.exercises.filter(exercise => exercise.title.includes(query)))
    //     }
    // }

    return (
        <>
            <PageTitle title={t`Patients`}

                button={<Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    style={{
                        width: 300,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textTransform: "none",
                        fontWeight: "bold",
                        fontSize: "large"
                    }}
                    startIcon={<AddCircleOutlineOutlinedIcon />}
                    onClick={() => {
                        setOpenDialog(true)
                        // console.log(`clicked, ${props.history}`)

                        // props.history.push('/app/addExercise')
                    }

                    }


                >

                    <Trans>Add an Patient</Trans>

                </Button>} />

            <div className={classes.container}>



                {
                    (myPatientsRes?.data) &&

                    <Card className={classes.excerciseContainer} >

                        {
                            (myPatientsRes?.data.myPatients.length === 0) &&
                            <Typography variant="h2" style={{ margin: 20 }}>
                                <Trans>Nothing found with the filter, change the filter</Trans>
                            </Typography>
                        }


                        {

                            myPatientsRes?.data.myPatients.map((patient) =>

                                <Typography> {patient.username} </Typography>
                                // <ExerciseView exercise={exercise} onClick={() => {
                                //     console.log("clicked")
                                //     props.history.push('/app/editExercise', {
                                //         exercise: exercise
                                //     })
                                // }} />
                            )
                        }

                    </Card>
                }


            </div>

            <Dialog open={openDialog} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title"><Trans>Add an Patient</Trans></DialogTitle>
                <DialogContent>

                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label={t`Username`}
                        type="text"
                        fullWidth
                        onChange={handleUserInput}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label={t`Password`}
                        type="password"
                        onChange={handleUserInput}

                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t`Name`}
                        type="text"
                        fullWidth
                        onChange={handlePatientInfo}

                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="age"
                        label={t`Age`}
                        type="number"
                        fullWidth
                        onChange={handlePatientInfo}

                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="weight"
                        label={t`Weight`}
                        type="number"
                        fullWidth
                        onChange={handlePatientInfo}

                    />

                    {/* <LinearProgress style={{ marginTop: 20 }} /> */}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        <Trans>Cancel</Trans>
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        <Trans>Add</Trans>
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );

}