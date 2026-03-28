package com.datalabel.common;

import com.datalabel.entity.Organization;
import com.datalabel.entity.User;
import com.datalabel.service.OrganizationService;
import com.datalabel.service.RoleOrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataPermissionUtils {
    
    @Autowired
    private RoleOrganizationService roleOrganizationService;
    
    @Autowired
    private OrganizationService organizationService;
    
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
        
        List<Long> directOrgIds = roleOrganizationService.findOrgIdsByRoleId(roleId);
        // 包含所有子机构
        Set<Long> allOrgIds = new HashSet<>(directOrgIds);
        for (Long orgId : directOrgIds) {
            allOrgIds.addAll(getAllDescendantIds(orgId));
        }
        return new ArrayList<>(allOrgIds);
    }
    
    /**
     * 获取指定机构的所有后代机构ID
     */
    private Set<Long> getAllDescendantIds(Long orgId) {
        Set<Long> result = new HashSet<>();
        List<Organization> children = organizationService.findByParentId(orgId);
        for (Organization child : children) {
            result.add(child.getId());
            result.addAll(getAllDescendantIds(child.getId()));
        }
        return result;
    }
    
    public boolean hasOrgPermission(User user, Long orgId) {
        if (orgId == null) {
            return false;
        }
        
        if (isAdmin(user)) {
            return true;
        }
        
        List<Long> orgIds = getAccessibleOrgIds(user);
        return orgIds.contains(orgId);
    }
    
    public User getCurrentUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        return (User) session.getAttribute("currentUser");
    }
}
