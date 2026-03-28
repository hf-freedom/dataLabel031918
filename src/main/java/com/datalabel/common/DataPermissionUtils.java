package com.datalabel.common;

import com.datalabel.entity.User;
import com.datalabel.service.RoleOrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.List;
import java.util.Set;

@Component
public class DataPermissionUtils {
    
    @Autowired
    private RoleOrganizationService roleOrganizationService;
    
    public boolean isAdmin(User user) {
        return user != null && user.getUserType() != null && user.getUserType() == 1;
    }
    
    public List<Long> getAccessibleOrgIds(User user) {
        if (user == null) {
            return Collections.emptyList();
        }
        
        if (isAdmin(user)) {
            return null;
        }
        
        Long roleId = user.getRoleId();
        if (roleId == null) {
            return Collections.emptyList();
        }
        
        return roleOrganizationService.findOrgIdsByRoleId(roleId);
    }
    
    public Set<Long> getAccessibleOrgIdsWithChildren(User user) {
        if (user == null) {
            return Collections.emptySet();
        }
        
        if (isAdmin(user)) {
            return null;
        }
        
        Long roleId = user.getRoleId();
        if (roleId == null) {
            return Collections.emptySet();
        }
        
        return roleOrganizationService.findAllOrgIdsByRoleId(roleId);
    }
    
    public boolean hasOrgPermission(User user, Long orgId) {
        if (orgId == null) {
            return false;
        }
        
        if (isAdmin(user)) {
            return true;
        }
        
        Set<Long> orgIds = getAccessibleOrgIdsWithChildren(user);
        return orgIds.contains(orgId);
    }
    
    public User getCurrentUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        return (User) session.getAttribute("currentUser");
    }
}
