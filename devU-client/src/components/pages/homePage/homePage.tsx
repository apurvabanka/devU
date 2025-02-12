import React, {useEffect, useState} from 'react'

import PageWrapper from 'components/shared/layouts/pageWrapper'
import LoadingOverlay from 'components/shared/loaders/loadingOverlay'
import ErrorPage from '../errorPage/errorPage'
import styles from './homePage.scss'
import UserCourseListItem from "../../listItems/userCourseListItem";

import {useAppSelector} from 'redux/hooks'
import RequestService from 'services/request.service'
import {Assignment, Course} from 'devu-shared-modules'
import {useHistory} from "react-router-dom";
const HomePage = () => {
    const userId = useAppSelector((store) => store.user.id)
    
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [enrollCourses, setEnrollCourses] = useState(new Array<Course>())
    const [upcomingCourses,setupcomingCourses] = useState(new Array<Course>())
    const [pastCourses, setPastCourses] = useState(new Array<Course>())
    const [assignments, setAssignments] = useState(new Map<Course, Array<Assignment>>())
    const [instructorCourses, setInstructorCourses] = useState(new Array<Course>())

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        
        try {
            const assignmentMap = new Map<Course, Array<Assignment>>()
            const allCourses = await RequestService.get<{
                instructorCourses: Course[];
                activeCourses: Course[];
                pastCourses: Course[];
                upcomingCourses: Course[];
            }>(`/api/courses/user/${userId}`);
            const enrolledCourses: Course[] = allCourses.activeCourses;
            const upcomingCourses: Course[] = allCourses.upcomingCourses;
            const pastCourses: Course[] = allCourses.pastCourses;
            const instructorCourses: Course[] = allCourses.instructorCourses;
            
            const assignmentPromises = enrolledCourses.map((course) => {
                const assignments = RequestService.get<Assignment[]>(`/api/course/${course.id}/assignments/released`)
                return Promise.all([course, assignments])
            })
            const assignmentResults = await Promise.all(assignmentPromises)
            assignmentResults.forEach(([course, assignments]) => assignmentMap.set(course, assignments))
            
            const assignmentPromises_instructor = instructorCourses.map((course) => {
                const assignments = RequestService.get<Assignment[]>(`/api/course/${course.id}/assignments/released`)
                return Promise.all([course, assignments])
            })
            const assignmentResults_instructor = await Promise.all(assignmentPromises_instructor)
            assignmentResults_instructor.forEach(([course, assignments]) => assignmentMap.set(course, assignments))

            setAssignments(assignmentMap)
            setPastCourses(pastCourses)
            setEnrollCourses(enrolledCourses)
            setInstructorCourses(instructorCourses)
            setupcomingCourses(upcomingCourses)
           
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }


    if (loading) return <LoadingOverlay delay={250} />
    if (error) return <ErrorPage error={error} />
    const history = useHistory();
    return(
        <PageWrapper>
            <div className={styles.header}>
                <div className={styles.smallLine}></div>
                <h2>Courses</h2>
                <button className = {styles.create_course} onClick={() => {
                    history.push(`/addCoursesForm`)
                    }}>Create Course
                </button>
                <div className={styles.largeLine}></div>
            </div>
            <div className={styles.header}>
                <div className={styles.smallLine}></div>
                <h3>Current</h3>
                <div className={styles.largeLine}></div>
            </div>
            <div className={styles.coursesContainer}>
                {instructorCourses.map((course) => (
                     <div className={styles.courseCard} key={course.id}>
                    <UserCourseListItem course={course} assignments={assignments.get(course)} key={course.id}
                                         instructor = {true}/>
                                        </div>
                ))}
            </div>
            <div className={styles.coursesContainer}>
                {enrollCourses && enrollCourses.map((course) => (
                    <div className={styles.courseCard} key={course.id}>
                    <UserCourseListItem course={course} assignments={assignments.get(course)} key={course.id}/>
                    </div>
                ))}
                {enrollCourses.length === 0 && <h4>You do not have current enrollment yet</h4>}
            </div>

            <div className={styles.header}>
                <div className={styles.smallLine}></div>
                <h3>Completed</h3>
                <div className={styles.largeLine}></div>
            </div>


            <div className={styles.coursesContainer}>
                {pastCourses && pastCourses.map((course) => (
                    
                    <div className={styles.courseCard} key={course.id}>
                        <UserCourseListItem 
                        course={course} 
                        assignments={assignments.get(course)} 
                        past={true} 
                        />
                        </div>
                ))}
                {pastCourses.length === 0 && <h4>No completed courses</h4>}
            </div>

            <div className={styles.header}>
                <div className={styles.smallLine}></div>
                <h3>Upcoming</h3>
                <div className={styles.largeLine}></div>
                </div>

                <div className={styles.coursesContainer}>
                {upcomingCourses && upcomingCourses.map((course) => (
                    <div className={styles.courseCard} key={course.id}>
                    <UserCourseListItem course={course} assignments={assignments.get(course)} key={course.id}/>
                    </div>
                ))}
                {upcomingCourses.length === 0 && <h4>No upcoming Courses</h4>}
                </div>
          
           
            
        </PageWrapper>
    )
}

export default HomePage