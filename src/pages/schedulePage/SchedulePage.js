


import React, { useEffect, useState } from "react";
import {
    Grid,
    LinearProgress,
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
    DialogActions,
    IconButton,
    Accordion,
    AccordionSummary,
    FormControlLabel,
    AccordionDetails,
    Checkbox
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
import { CreatePatient, GetAllExercises, GetMyPatients, CreateTherapySchedule, UpdateTherapySchedule } from "../../api/queries";
import { Prompt, useLocation } from "react-router";
import { useAPIContext } from "../../context/APIContext";
import StyledButton from "../addEditExcercise/components/StyledButton/StyledButton";
import { PageState } from "../addEditExcercise/Constants";

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import SendIcon from '@material-ui/icons/Send';
import SaveIcon from '@material-ui/icons/Save';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Select from 'react-select'
import { Calendar, DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
// import JalaliUtils from "@date-io/jalaali";
import moment from "moment";
import jMoment from "moment-jalaali";
import JalaliUtils from "@date-io/jalaali";


import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import RestoreIcon from '@material-ui/icons/Restore';


import format from "date-fns/format";
import isValid from "date-fns/isValid";
import endOfWeek from "date-fns/endOfWeek";
import startOfWeek from "date-fns/startOfWeek";
import { isSameDay, isWithinInterval, isBefore, isAfter } from 'date-fns'
import { createStyles } from "@material-ui/styles";
// this guy required only on the docs site to work with dynamic date library
import { withStyles } from "@material-ui/core";
import clsx from "clsx";


import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ParameterView from "../addEditExcercise/components/ParameterView/ParameterView";
import { getUpdateDiff } from "../addEditExcercise/utils";
import { copyState, genStateFromAPIRes, getDoneAssessmentsCount, getScheduleDiff, getUpdateInput, isStateEdited, stateToCreateScheduleInput } from "./utils";
import { useUserDispatch } from "../../context/UserContext";



jMoment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });

export default function SchedulePage(props) {

    var classes = useStyles();

    const { history, location } = { ...props }

    console.log(location)

    let today = jMoment()
    const todayText = today.format("dddd jD jMMMM jYYYY ")

    // const [startDate, handleStartDateChange] = useState(jMoment());
    // const [endDate, handleEndDateChange] = useState(jMoment().add(1, "d"));
    // const [selectedDate, handleDateChange] = useState(jMoment());

    const apiContext = useAPIContext()
    const userContext = useUserDispatch()

    // console.log("questionares are ", questionares, userContext)



    var theme = useTheme();
    var patient = { ...location.state.patient.patient, username: location.state.patient.username }



    const [state, setState] = React.useState({
        state: PageState.COMPLETED_NOT_SENT,
        selectedExercises: [],
        therapyDays: [],
        schedule: {},
        startDate: jMoment(),
        endDate: jMoment().add(1, "d"),
        selectedDate: jMoment(),
        questionares: {},
        questionareSchedule: {}


    })
    const [prevState, setPrevState] = React.useState({
        state: PageState.NOT_LOADED,
        createdAt: 0,
        updatedAt: 0,
        selectedExercises: [],
        therapyDays: [],
        schedule: {},
        startDate: jMoment(),
        endDate: jMoment().add(1, "d"),
        selectedDate: jMoment(),
        addScheduleLoaded: false,
        questionares: {},
        questionareSchedule: {}



    })

    const [addSchedule, addScheduleRes] = useMutation(CreateTherapySchedule)
    const [updateSchedule, updateScheduleRes] = useMutation(UpdateTherapySchedule)


    const selectedDateText = state.selectedDate.format("dddd jD jMMMM jYYYY ")
    const selectedDateKey = state.selectedDate.format("jYYYY/jMM/jDD")


    const exercises = apiContext.state.exercises
    const questionares = userContext.therapist.questionares
    const exerciseOptions = exercises.map(exercise => { return { value: exercise.title, label: exercise.title, exercise: exercise } })
    const questionareOptions = questionares.map(questionare => { return { value: questionare.title, label: questionare.title, questionare: questionare } })
    var selectedQuestionaresForDay = []
    if (state.questionareSchedule[selectedDateKey]) {
        selectedQuestionaresForDay = state.questionareSchedule[selectedDateKey].map(id => {

            let questionare = questionares.find(item => item.id === id)
            return {
                value: questionare.title, label: questionare.title, questionare: questionare
            }
        })
    }


    const statistics = getDoneAssessmentsCount(patient.schedule)

    // console.log("selectedQuestionaresForDay", selectedQuestionaresForDay)

    const loadStateFromLocation = () => {

        if (patient.schedule) {

            if (prevState.state === PageState.NOT_LOADED) {


                setState({ ...genStateFromAPIRes(patient.schedule, exercises) })
                setPrevState({ ...genStateFromAPIRes(patient.schedule, exercises) })

            }

        }
    }
    loadStateFromLocation()


    // console.log("diff is ", getScheduleDiff())




    if (prevState != null && prevState.state !== PageState.NOT_LOADED && state.state !== PageState.SENDING) {
        console.log("prev is", prevState)
        var edited = isStateEdited(state, prevState)

        console.log("it is edited", edited)
        // console.log(edited)

        if (state.state !== PageState.EDITED && edited) {
            setState({ ...state, state: PageState.EDITED })
        }
        if (state.state === PageState.EDITED && !edited) {
            setState({ ...state, state: PageState.SENT })
        }

    }


    const isComplete = state.selectedExercises !== []


    if (state.state === PageState.NOT_COMPLETED) {


        // console.log("isCOplete?", isComplete)

        if (isComplete)
            setState({ ...state, state: PageState.COMPLETED_NOT_SENT })
    }

    if (state.state === PageState.COMPLETED_NOT_SENT) {

        if (!isComplete)
            setState({ ...state, state: PageState.NOT_COMPLETED })

    }


    // console.log("addschedule is ", addScheduleRes)


    // console.log("end date is ", state.endDate)
    // console.log(state.selectedDate.format("YYYY/MM/DD"))

    // const [createUser, createUserRes] = useMutation(CreatePatient)

    // const myPatientsRes = useQuery(GetMyPatients)

    // const [myPatients, setMyPatients] = React.useState([])



    // const [openDialog, setOpenDialog] = React.useState(false);

    // const location = useLocation()


    // const [getAllExercises, getAllExercisesState] = useLazyQuery(GetAllExercises)

    // const apiContext = useAPIContext()


    const handleEndDateChange = (date) => {


        generateScheduleFromStartToEnd(state.selectedExercises, state.startDate, date)
        setState({ ...state, endDate: date })
    }

    const handleStartDateChange = (date) => {
        generateScheduleFromStartToEnd(state.selectedExercises, date)
        setState({ ...state, startDate: date })
    }


    const onQuestionareChanged = (e) => {

        const newSelectedQuestionareIds = e.map(item => item.questionare.id)
        state.questionareSchedule[selectedDateKey] = [...newSelectedQuestionareIds]
        setState({ ...state })

    }

    const onExercisesChanged = (e) => {

        let newList = e.map(item => item.exercise)

        generateScheduleFromStartToEnd(newList, state.startDate, state.endDate)

        console.log("prev exercise list is ", state.selectedExercises, "new is ", newList)

        setState({ ...state, selectedExercises: e.map(item => item.exercise) })
    }



    if (addScheduleRes.data != null) {
        console.log("data is not null", addScheduleRes.data.addTherapySchedule)

        // console.log("a")

        if (!prevState.addScheduleLoaded) {
            // console.log("an exercise is added", addExcerciseQuery.data.addExercise)
            apiContext.dispatch({ type: 'addSchedule', schedule: addScheduleRes.data.addTherapySchedule, patient: patient })

            // const genSchedule =  addScheduleRes.data.addTherapySchedule.days.reduce((acc, day) => {
            //     acc[day.date] = day.parameters.map(item => { return { ...item } })
            //     return acc
            // }, {})

            setState({ ...genStateFromAPIRes(addScheduleRes.data.addTherapySchedule, exercises) })
            setPrevState({ ...genStateFromAPIRes(addScheduleRes.data.addTherapySchedule, exercises), addScheduleLoaded: true })



        }


        if (state.state === PageState.SENDING) {
            setState({ ...state, state: PageState.SENT })
        }
    }

    if (updateScheduleRes.data != null) {

        let transformed = genStateFromAPIRes(updateScheduleRes.data.updateTherapySchedule, exercises)
        if (isStateEdited(transformed, prevState)) {
            apiContext.dispatch({ type: 'addSchedule', schedule: updateScheduleRes.data.updateTherapySchedule, patient: patient })
            setState({ ...genStateFromAPIRes(updateScheduleRes.data.updateTherapySchedule, exercises) })
            setPrevState({ ...transformed, addScheduleLoaded: true })

        }

    }

    const stateToSecondButtonProps = () => {
        var props = {
            className: classes.button,
            icon: <RestoreIcon />,
            label: t`Restore`,
            disabled: false,
            onClick: (e) => {
                setState({ ...copyState(prevState), selectedDate: state.selectedDate, state: PageState.SENT })
            }
        }

        if (state.state === PageState.SENT)
            props = {
                ...props, icon: <ArrowBackIcon />, label: t`Back`,
                onClick: (e) => {

                    history.replace('/app/patients')
                }
            }

        return props
    }


    const stateToButtonProps = () => {

        var props = {
            className: classes.buttonSuccess,
            icon: <SendIcon />,
            label: (state.state === PageState.COMPLETED_NOT_SENT) ? t`Submit` : t`Sumbit Edit`,
            disabled: false,
            onClick: () => {
                console.log("clicked, send update")

            }
        }
        switch (state.state) {
            case PageState.NOT_COMPLETED:
                props = {
                    ...props,
                    disabled: true,
                    label: t`Form is incomplete`
                }
                break

            case PageState.COMPLETED_NOT_SENT:
                props = {
                    ...props,
                    onClick: (e) => {
                        const dates = Object.keys(state.schedule)

                        console.log("doAddScheduless", {
                            startDate: state.startDate.format("jYYYY/jMM/jDD"),
                            endDate: state.endDate.format("jYYYY/jMM/jDD"),
                            exercises: state.selectedExercises.map(exercise => exercise.id),
                            days: dates.map(date => {
                                console.log("date is", date, state.schedule[date])
                                // let val = state.schedule[date]
                                return {
                                    date: date,
                                    parameters: state.schedule[date]
                                }
                            })
                        })


                        addSchedule({
                            variables: stateToCreateScheduleInput(state, patient)
                        })
                        // doAddExcercise({
                        //     variables: {
                        //         addExerciseInput: state
                        //     }
                        // })
                        // setState({ ...state, state: PageState.SENDING })
                    }

                }
                break

            case PageState.EDITED:
                props = {
                    ...props,
                    onClick: () => {
                        updateSchedule({
                            variables: {
                                patientId: patient.id,

                                updateInput: getUpdateInput(state, prevState)
                            }
                        })
                        setState({ ...state, state: PageState.SENDING })

                    }
                }
                break

            case PageState.SENDING:
                props = {
                    ...props,
                    icon: <SaveIcon />,
                    label: t`Sending`,
                    disabled: true,
                    loading: true
                }
                break

            case PageState.SENT:
                props = {
                    ...props,
                    className: classes.buttonSuccess,
                    icon: <CheckCircleOutlineIcon />,
                    label: t`Sent`,
                    disabled: false,
                    onClick: () => { history.goBack() }
                }

                break
            default:
                break;
        }

        return props

    }




    const selectStyle = {
        control: base => ({
            ...base,
            fontSize: 25
        }),
        menu: base => ({
            ...base,

            fontSize: 25
        })
    };
    // let startDateClone = startDate.toDate()
    // let endDateClone = endDate.toDate()


    // const moment = jMoment()




    const generateScheduleFromStartToEnd = (newSelectedExercises = state.selectedExercises, startDate = state.startDate, endDate = state.endDate) => {

        var date = jMoment(startDate)
        var formatedDate = date.format("jYYYY/jMM/jDD")


        var autogenScheduleDay = newSelectedExercises.filter(exercise => exercise.type === "Exercise").map(exercise => {
            let params = exercise.parameters.reduce((acc, item) => {
                return {
                    ...acc,
                    [item.name]: item
                }
            }, {})
            return { exerciseId: exercise.id, parameters: params, enabled: true, title: exercise.title }

        })
        console.log("generating schedule", autogenScheduleDay)
        console.log(startDate, endDate, date, date.isBetween(startDate, endDate))

        if (date.isBefore(today)) {
            date = today
        }



        while (date.isBetween(startDate, endDate) || date.isSame(endDate, "day") || date.isSame(startDate, "day") || (startDate.isSame(today, "day") && today.isSame(date, "day"))) {
            formatedDate = date.format("jYYYY/jMM/jDD")


            if (state.questionareSchedule[formatedDate] === undefined)
                state.questionareSchedule[formatedDate] = []

            if (state.schedule[formatedDate] === undefined) {
                state.schedule[formatedDate] = [...autogenScheduleDay]
            } else {
                var newlyAddedItems = autogenScheduleDay.filter(item => !state.schedule[formatedDate].some(e => e.exerciseId === item.exerciseId)).map(item => { return { ...item } })

                var filtererd = state.schedule[formatedDate].filter(item => {

                    return autogenScheduleDay.some(e => e.exerciseId === item.exerciseId)
                }).map(item => { return { ...item } })


                state.schedule[formatedDate] = [...filtererd, ...newlyAddedItems]
            }

            date = date.add(1, "day")

        }
    }
    // generateScheduleFromStartToEnd()

    console.log("state is ", state)

    const renderWrappedWeekDay = (date, _, dayInCurrentMonth, dayComponent) => {


        const isSameAsStartDate = date.isSame(state.startDate, "day") && state.startDate.isSameOrAfter(today)
        const isStartSameAsToday = state.startDate.isSame(today, "day") && today.isSame(date, "day")

        const isSelectedDay = date.isSame(state.selectedDate, "day")
        // const isSelectedDay = date.isSameDate(selectedDate)
        const isPastGoneDays = date.isBetween(state.startDate, today, "day") || date.isSame(state.startDate, "day")

        const dayIsBetween = date.isBetween(state.startDate, state.endDate, "day") || isSelectedDay || isStartSameAsToday || isSameAsStartDate || date.isSame(state.endDate, "day") || date.isSame(state.startDate, "day")


        if (dayIsBetween) {
            let formatedDate = date.format("jYYYY/jMM/jDD")

            // if (state.schedule)
        }



        const wrapperClassName = clsx({
            [classes.highlight]: dayIsBetween,
            [classes.disabledDateHighlight]: isPastGoneDays,
            [classes.selectedDateHighlight]: isSelectedDay,
            // [classes.endHighlight]: isLastDay,
        });

        const dayClassName = clsx(classes.day, {
            [classes.nonCurrentMonthDay]: !dayIsBetween,
            [classes.highlightedDates]: dayIsBetween,
        });

        return (
            <div className={wrapperClassName} onClick={(e) => {
                e.stopPropagation()
                if (dayIsBetween && !isPastGoneDays) {

                    setState({ ...state, selectedDate: date })
                }
            }} >
                <IconButton className={dayClassName}>
                    <span style={{
                        fontSize: 18
                    }}> {date.format("jD")} </span>
                </IconButton>
            </div>
        );
    };



    const handleParameterEnableSwap = (item) => {

        return (event) => {
            const name = event.target.name;
            const value = event.target.checked


            state.schedule[selectedDateKey] = state.schedule[selectedDateKey].map(daySchedule => {
                if (daySchedule.exerciseId === item.exerciseId) {
                    daySchedule.parameters = {
                        ...daySchedule.parameters,
                        [name]: {
                            ...daySchedule.parameters[name],
                            enabled: value
                        }
                    }
                }
                return daySchedule
            })

            state.schedule = { ...state.schedule }

            setState({
                ...state
            })
        }

    }



    const handleExerciseForDayEnableSwap = (event, item) => {


        const value = event.target.checked
        state.schedule[selectedDateKey] = state.schedule[selectedDateKey].map(daySchedule => {
            // console.log("mapping, ", daySchedule)
            if (daySchedule.exerciseId === item.exerciseId) {
                daySchedule = {
                    ...daySchedule,
                    enabled: value
                }

            }


            return daySchedule
        })
        state.schedule = { ...state.schedule }

        setState({ ...state })


    }

    const handleAdditionalInstructionChange = (item) => {
        return (e) => {
            state.schedule[selectedDateKey] = state.schedule[selectedDateKey].map(daySchedule => {
                if (daySchedule.exerciseId === item.exerciseId) {
                    daySchedule = {
                        ...daySchedule,
                        additionalInstructions: e.target.value
                    }
                }
                return daySchedule
            })

            setState({ ...state })

        }
    }

    const handleParameterChange = (item) => {
        return (event, value, isFirstValueAssign = true) => {
            const name = event.target.name;

            if (isFirstValueAssign) {

                state.schedule[selectedDateKey] = state.schedule[selectedDateKey].map(daySchedule => {
                    if (daySchedule.exerciseId === item.exerciseId) {
                        daySchedule = {
                            ...daySchedule,
                            parameters: {
                                ...daySchedule.parameters,
                                [name]: {
                                    ...daySchedule.parameters[name],
                                    value: parseInt(value)
                                }
                            }
                        }
                    }
                    return daySchedule
                })

            }
            else {
                state.schedule[selectedDateKey] = state.schedule[selectedDateKey].map(daySchedule => {
                    if (daySchedule.exerciseId === item.exerciseId) {
                        daySchedule = {
                            ...daySchedule,
                            parameters: {
                                ...daySchedule.parameters,
                                [name]: {
                                    ...daySchedule.parameters[name],
                                    secondValue: parseInt(value)
                                }
                            }
                        }
                    }
                    return daySchedule
                })
            }


            setState({ ...state })
        }
    }

    return (
        <>
            <div style={{
                position: "relative",
                marginBottom: 200
            }}>

                {
                    <Prompt
                        when={PageState.SENT !== state.state}
                        message={location =>
                            t`Are you sure? information change would be lost.`
                        }
                    />
                }

                <div style={{ position: "absolute", display: "flex", justifyContent: "flex-end", width: "90%", flexDirection: "column", alignItems: "end" }}>

                    <StyledButton props={stateToButtonProps(state.state)} />
                    {(state.state === PageState.EDITED || state.state === PageState.SENT) && <StyledButton props={stateToSecondButtonProps(state.state)} />}

                </div>

                <div>


                    <PageTitle title={t`Therapy Schedule`} />

                    <div className={classes.mainContainer}>

                        <div style={{ display: "flex", flexWrap: "wrap" }}>

                            <Paper style={{ width: 300, margin: 20, padding: 20 }} elevation={2}>
                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Name</Trans> : {patient.name}
                                </Typography>


                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Username</Trans> : {patient.username}
                                </Typography>


                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Age</Trans> : {patient.age}
                                </Typography>
                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Weight</Trans> : {patient.weight}
                                </Typography>
                                <Button size="large" color="primary" style={{ marginTop: 15 }}>
                                    <Trans>Edit Information</Trans>
                                </Button>

                            </Paper>
                            <Paper style={{ width: 300, margin: 20, padding: 20 }}

                                onClick={(e) => {

                                    props.history.push('/app/evaluation', {
                                        patient: patient
                                    })
                                }}
                            >
                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Done Assesments</Trans> : {statistics.doneAssessments}
                                </Typography>



                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Unread Assesments</Trans> : 0
                                </Typography>

                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Sessions Done</Trans> : {statistics.doneDays}
                                </Typography>

                                <Typography style={{ marginTop: 25 }} variant="h5" >
                                    <Trans>Sessions</Trans> : {statistics.totalDays}
                                </Typography>

                                <Button size="large" color="primary" style={{ marginTop: 15 }}>
                                    <Trans>Read Assesments</Trans>
                                </Button>

                            </Paper>

                        </div>


                        <div style={{ display: "flex" }}>

                            <Typography style={{ marginTop: 25 }} variant="h2" >
                                <Trans>Exercises</Trans>
                            </Typography>
                            {/* <IconButton color="primary" aria-label="add an exercise" >
                                <AddCircleOutlineIcon style={{ width: 50, height: 50, margin: 8 }} />
                            </IconButton> */}

                        </div>
                        <div style={{ marginTop: 20, padding: 25 }}>

                            <Select
                                defaultValue={state.selectedExercises.map(exercise => { return { value: exercise.title, label: exercise.title, exercise: exercise } })}
                                isMulti
                                name="exercises"
                                options={exerciseOptions}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                styles={selectStyle}
                                onChange={onExercisesChanged}
                                placeholder={t`Select Exercises`}
                            />
                        </div>


                        <Typography style={{ marginTop: theme.spacing(5) }} variant="h2" >
                            <Trans>Schedule</Trans>
                        </Typography>
                        {/* */}
                        <div style={{ display: "flex", marginTop: 0, flexDirection: "column" }}>


                            <MuiPickersUtilsProvider utils={JalaliUtils} locale="fa"   >
                                <div style={{ display: "flex", marginTop: 40, flexWrap: "wrap" }}>


                                    <Typography style={{ margin: 20 }} variant="h5" >
                                        <Trans>Start Date</Trans> :
                        </Typography>
                                    <DatePicker
                                        okLabel="تأیید"
                                        cancelLabel="لغو"
                                        labelFunc={date => (date ? date.format("jYYYY/jMM/jDD") : "")}
                                        value={state.startDate}
                                        onChange={handleStartDateChange}
                                        style={{ margin: 12 }}
                                    />

                                    <Typography style={{ margin: 20 }} variant="h5" >
                                        <Trans>End Date</Trans> :
                                    </Typography>

                                    <DatePicker
                                        okLabel="تأیید"
                                        cancelLabel="لغو"
                                        labelFunc={date => (date ? date.format("jYYYY/jMM/jDD") : "")}
                                        value={state.endDate}
                                        onChange={handleEndDateChange}
                                        style={{ margin: 12 }}
                                    />

                                </div>

                                <div style={{
                                    marginTop: 10, justifyContent: "start"
                                    , marginBottom: 15
                                    // , alignItems: "center"
                                    , display: "flex",
                                    flexWrap: "wrap"
                                }}
                                >
                                    <Typography style={{ margin: 20 }} variant="h5" >
                                        <Trans>Schedule Day</Trans> :
                                    </Typography>

                                    <Paper elevation={3} style={{ margin: 5 }}>
                                        <DatePicker

                                            variant="static"
                                            labelFunc={date => (date ? date.format("jYYYY/jMM/jDD") : "")}
                                            value={state.selectedDate}
                                            onChange={(e) => { }}
                                            renderDay={renderWrappedWeekDay}
                                            // fullWidth
                                            minDate={today}
                                            maxDate={state.endDate}
                                            views="date"
                                        />
                                    </Paper>

                                    <Typography style={{ margin: 20 }} variant="h5" >
                                        <Trans>Today</Trans> :
                                    </Typography>


                                    <Typography style={{ marginTop: 20 }} variant="h5" >
                                        {todayText}
                                    </Typography>


                                </div>

                                {/* <Calendar date={selectedDate} /> */}
                            </MuiPickersUtilsProvider>
                            <div style={{
                                marginTop: 10, justifyContent: "start"
                                , marginBottom: 15
                                // , alignItems: "center"
                                , display: "flex",
                                flexWrap: "wrap"
                            }}
                            >
                                <Typography style={{ margin: 20 }} variant="h5" >
                                    <Trans>Parameters management for day</Trans> :
                                    </Typography>


                                <Typography style={{ marginTop: 20 }} variant="h5" >
                                    {selectedDateText}
                                </Typography>
                            </div>

                            {
                                (state.schedule[selectedDateKey] && state.schedule[selectedDateKey].length > 0) &&
                                <Paper elevation={3}>


                                    {state.schedule[selectedDateKey].map(item => {
                                        return (<Accordion elevation={3}
                                            key={item.id}

                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-label="Expand"
                                                aria-controls="additional-actions1-content"
                                                id="additional-actions1-header"
                                            >
                                                <FormControlLabel
                                                    aria-label="Acknowledge"
                                                    onClick={(event) => event.stopPropagation()}
                                                    onFocus={(event) => event.stopPropagation()}
                                                    control={<Checkbox
                                                        checked={item.enabled}
                                                        onChange={(e) => {
                                                            handleExerciseForDayEnableSwap(e, item)
                                                        }}
                                                        name={item.exerciseId}
                                                        color="primary"
                                                    />}
                                                    label={item.title}
                                                />
                                            </AccordionSummary>
                                            <AccordionDetails>

                                                {
                                                    item.enabled &&
                                                    <div style={{ display: "flex", flexDirection: "column" }}

                                                    >
                                                        <div className={classes.parametersContainer}>


                                                            {

                                                                Object.keys(item.parameters).map(key =>
                                                                    <ParameterView parameter={item.parameters[key]}
                                                                        handleParameterChange={handleParameterChange(item)}
                                                                        key={item.parameters[key].name}
                                                                        handleParameterEnableSwap={handleParameterEnableSwap(item)}
                                                                    />)


                                                            }



                                                        </div>


                                                        <TextField className={classes.longDescription} multiline rows={5} rowsMax={20} id="outlined-basic"
                                                            label={t`Additional Instructions`} variant="outlined"
                                                            value={item.additionalInstructions || ""}
                                                            onChange={handleAdditionalInstructionChange(item)}
                                                            name="additionalInstruction"
                                                        />




                                                    </div>

                                                }
                                            </AccordionDetails>


                                        </Accordion>
                                        )
                                    })
                                    }

                                </Paper>



                            }

                            {(state.questionareSchedule[selectedDateKey]) &&

                                <div>
                                    <Typography style={{ marginTop: 25 }} variant="h2" >
                                        <Trans>Questionares</Trans>
                                    </Typography>
                                    <div style={{ marginTop: 20 }}>

                                        <Select

                                            value={
                                                selectedQuestionaresForDay
                                            }
                                            isMulti
                                            name="questionare"
                                            options={questionareOptions}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            styles={selectStyle}
                                            onChange={onQuestionareChanged}
                                            placeholder={t`Select Questionare`}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div >


        </>
    );

}