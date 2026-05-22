package com.meson.repository;

import com.meson.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);

    @Query("""
            SELECT sp FROM StudentProfile sp
            LEFT JOIN FETCH sp.courseCategory
            LEFT JOIN FETCH sp.approvedDirectionGroup dg
            LEFT JOIN FETCH dg.courseCategory
            WHERE sp.user.id = :userId
            """)
    Optional<StudentProfile> findByUserIdWithDetails(@Param("userId") Long userId);

    long countByApprovedDirectionGroupId(Long directionGroupId);

    @Query("""
            SELECT sp FROM StudentProfile sp
            JOIN FETCH sp.user u
            WHERE sp.approvedDirectionGroup.id = :groupId
            ORDER BY u.mbiemri, u.emri
            """)
    List<StudentProfile> findMembersByDirectionGroupId(@Param("groupId") Long groupId);
}
