package com.apexev.repository.userAndVehicle;

import com.apexev.entity.User;
import com.apexev.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    // Tìm user bằng số điện thoại
    Optional<User> findByPhone(String phone);

    Optional<User> findByUserId(Integer userId);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole(UserRole role);

    //tìm người dùng có vai trò là Admin hoac Nurse
    @Query("select u from User u where u.role='ADMIN' or u.role='NURSE'")
    List<User> findAllAdminAndNurse ();

    // tìm người dùng có vai trò là Nurse
    @Query("select u from User u where u.role='NURSE'")
    List<User> findAllNurse ();

    // tìm người dùng có vai trò là PRINCIPAL
    @Query ("select u from User u where u.role='PRINCIPAL'")
    User findPrincipal ();



    Page<User> findAll(Specification<User> spec, Pageable pageable);
}
