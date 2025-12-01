package com.apexev.exception;

public class PartNotFoundException extends RuntimeException {
    public PartNotFoundException(String message) {
        super(message);
    }

    public PartNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
