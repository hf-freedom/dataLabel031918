package com.datalabel.service;

import com.datalabel.entity.Organization;
import com.datalabel.mapper.OrganizationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrganizationService {
    
    @Autowired
    private OrganizationMapper organizationMapper;
    
    public Organization findById(Long id) {
        return organizationMapper.findById(id);
    }
    
    public List<Organization> findAll() {
        return organizationMapper.findAll();
    }
    
    public List<Organization> findByParentId(Long parentId) {
        return organizationMapper.findByParentId(parentId);
    }
    
    public boolean save(Organization org) {
        if (org.getId() == null) {
            return organizationMapper.insert(org) > 0;
        } else {
            if (org.getParentId() != null && org.getParentId().equals(org.getId())) {
                return false;
            }
            if (org.getParentId() != null && isDescendant(org.getId(), org.getParentId())) {
                return false;
            }
            return organizationMapper.update(org) > 0;
        }
    }
    
    public boolean update(Organization org) {
        return organizationMapper.update(org) > 0;
    }
    
    public boolean deleteById(Long id) {
        return organizationMapper.deleteById(id) > 0;
    }
    
    private boolean isDescendant(Long orgId, Long potentialParentId) {
        Set<Long> visited = new HashSet<>();
        return checkDescendant(orgId, potentialParentId, visited);
    }
    
    private boolean checkDescendant(Long currentId, Long targetId, Set<Long> visited) {
        if (currentId == null || visited.contains(currentId)) {
            return false;
        }
        visited.add(currentId);
        if (currentId.equals(targetId)) {
            return true;
        }
        List<Organization> children = organizationMapper.findByParentId(currentId);
        for (Organization child : children) {
            if (checkDescendant(child.getId(), targetId, visited)) {
                return true;
            }
        }
        return false;
    }
    
    public Set<Long> findAllDescendantIds(Long orgId) {
        Set<Long> result = new HashSet<>();
        result.add(orgId);
        collectDescendantIds(orgId, result);
        return result;
    }
    
    private void collectDescendantIds(Long parentId, Set<Long> result) {
        List<Organization> children = organizationMapper.findByParentId(parentId);
        for (Organization child : children) {
            result.add(child.getId());
            collectDescendantIds(child.getId(), result);
        }
    }
}
