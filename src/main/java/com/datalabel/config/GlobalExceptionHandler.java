package com.datalabel.config;

import com.datalabel.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(Exception.class)
    public Result<String> handleException(Exception e) {
        logger.error("系统异常: ", e);
        return Result.error("系统错误: " + e.getMessage());
    }
    
    @ExceptionHandler(RuntimeException.class)
    public Result<String> handleRuntimeException(RuntimeException e) {
        logger.error("运行时异常: ", e);
        return Result.error("操作失败: " + e.getMessage());
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public Result<String> handleIllegalArgumentException(IllegalArgumentException e) {
        logger.error("参数异常: ", e);
        return Result.error("参数错误: " + e.getMessage());
    }
}
