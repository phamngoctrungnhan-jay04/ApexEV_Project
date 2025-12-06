package com.apexev.exception;

public class DuplicatePartException extends RuntimeException {
    public DuplicatePartException(String message) {
        super(message);
    }

    public DuplicatePartException(String message, Throwable cause) {
        super(message, cause);
    }
}
