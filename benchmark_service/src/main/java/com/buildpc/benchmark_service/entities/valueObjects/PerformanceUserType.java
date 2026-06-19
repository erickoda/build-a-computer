package com.buildpc.benchmark_service.entities.valueObjects;

import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.usertype.UserType;
import org.postgresql.util.PGobject;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public class PerformanceUserType implements UserType<Performance> {
    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public Class<Performance> returnedClass() {
        return Performance.class;
    }

    @Override
    public Performance nullSafeGet(ResultSet rs, int position,
                                  WrapperOptions options) throws SQLException {
        Object value = rs.getObject(position);
        if (rs.wasNull() || value == null) return null;
        return Performance.fromDatabaseValue(value.toString());
    }

    @Override
    public void nullSafeSet(PreparedStatement st, Performance value, int index,
                            WrapperOptions options) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            PGobject pgObject = new PGobject();
            pgObject.setType("performance");
            pgObject.setValue(value.toDatabaseValue());
            st.setObject(index, pgObject);
        }
    }

    @Override
    public boolean equals(Performance x, Performance y) { return x == y; }

    @Override
    public int hashCode(Performance x) { return x != null ? x.hashCode() : 0; }

    @Override
    public Performance deepCopy(Performance value) { return value; }

    @Override
    public boolean isMutable() { return false; }

    @Override
    public Serializable disassemble(Performance value) { return value; }

    @Override
    public Performance assemble(Serializable cached, Object owner) { return (Performance) cached; }
}
